import { env } from '@shared/config'

/** 같은 시나리오의 훈련 횟수를 기준으로 서버가 결정하는 대답 안내입니다. */
export interface ScriptHint {
  level: number
  text: string
}

export type VoiceServerMessage =
  | { type: 'scenario_info'; aiRole: string; scriptLevel?: number }
  | { type: 'emotion'; value: string }
  | { type: 'speaking_end'; turn_id?: number }
  | { type: 'interrupt' | 'pong' }
  | { type: 'transcript'; role: 'ai' | 'user'; text: string }
  | ({ type: 'script_hint' } & ScriptHint)
  | { type: 'notice'; code: string; text: string }
  | { type: 'end'; reason: string }
  | { type: 'error'; code: string }

/** Spring의 내부 wsUrl 대신 검증된 외부 AI 주소와 세션 ID를 사용합니다. */
export const createVoiceUrl = (sessionId: string, token: string) => {
  const url = new URL(env.aiApiBaseUrl)
  if (!['http:', 'https:', 'ws:', 'wss:'].includes(url.protocol)) throw new Error('WS_INVALID_URL')
  url.protocol = ['https:', 'wss:'].includes(url.protocol) ? 'wss:' : 'ws:'
  if (window.location.protocol === 'https:' && url.protocol !== 'wss:')
    throw new Error('WS_INSECURE_URL')
  url.pathname = `${url.pathname.replace(/\/$/, '')}/ws/voice/${encodeURIComponent(sessionId)}`
  url.search = ''
  url.hash = ''
  if (env.voiceAuthMode === 'query') url.searchParams.set('token', token)
  return url.toString()
}

/** 서버 JSON을 종류별로 검증하고 알 수 없는 확장 메시지는 무시합니다. */
export const parseVoiceMessage = (text: string): VoiceServerMessage | null => {
  if (text.length > 65536) throw new Error('WS_INVALID_MESSAGE')
  let data: unknown
  try {
    data = JSON.parse(text)
  } catch {
    // 앱 훅처럼 잘못된 JSON 안내 프레임 하나 때문에 음성 통화를 끊지 않습니다.
    return null
  }
  if (!data || typeof data !== 'object' || !('type' in data)) return null
  const message = data as Record<string, unknown>
  switch (message.type) {
    case 'scenario_info':
      if (typeof message.aiRole === 'string')
        return {
          type: 'scenario_info',
          aiRole: message.aiRole,
          scriptLevel: typeof message.scriptLevel === 'number' ? message.scriptLevel : undefined,
        }
      break
    case 'emotion':
      if (typeof message.value === 'string') return { type: 'emotion', value: message.value }
      break
    case 'speaking_end':
      return {
        type: 'speaking_end',
        turn_id: Number.isSafeInteger(message.turn_id) ? (message.turn_id as number) : undefined,
      }
    case 'interrupt':
    case 'pong':
      return { type: message.type }
    case 'transcript':
      if ((message.role === 'ai' || message.role === 'user') && typeof message.text === 'string')
        return { type: 'transcript', role: message.role, text: message.text }
      break
    case 'script_hint':
      if (typeof message.level === 'number' && Number.isFinite(message.level))
        return {
          type: 'script_hint',
          level: message.level,
          text: typeof message.text === 'string' ? message.text.trim() : '',
        }
      return null
    case 'notice':
      if (typeof message.code === 'string' && typeof message.text === 'string')
        return { type: 'notice', code: message.code, text: message.text }
      break
    case 'end':
      if (typeof message.reason === 'string') return { type: 'end', reason: message.reason }
      break
    case 'error':
      if (typeof message.code === 'string') return { type: 'error', code: message.code }
      break
    default:
      return null
  }
  throw new Error('WS_INVALID_MESSAGE')
}
