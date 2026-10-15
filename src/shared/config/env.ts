type UrlEnvironmentKey = 'VITE_API_BASE_URL' | 'VITE_AI_API_BASE_URL'

// 필수 URL 환경변수의 존재 여부와 형식을 검증합니다.
const readUrlEnvironment = (key: UrlEnvironmentKey, value: string | undefined) => {
  if (!value) {
    throw new Error(`[환경변수 오류] ${key}가 설정되지 않았습니다.`)
  }

  try {
    return new URL(value).toString().replace(/\/$/, '')
  } catch {
    throw new Error(`[환경변수 오류] ${key}는 유효한 URL이어야 합니다.`)
  }
}

/** 배포 서버에 맞는 음성 인증 모드를 검증합니다. */
const readVoiceAuthMode = (value: string | undefined): 'frame' | 'query' => {
  if (value === undefined || value === 'frame') return 'frame'
  if (value === 'query') return 'query'
  throw new Error('[환경변수 오류] VITE_VOICE_AUTH_MODE는 frame 또는 query여야 합니다.')
}

const configuredAiApiBaseUrl = readUrlEnvironment(
  'VITE_AI_API_BASE_URL',
  import.meta.env.VITE_AI_API_BASE_URL,
)

export const env = {
  apiBaseUrl: readUrlEnvironment('VITE_API_BASE_URL', import.meta.env.VITE_API_BASE_URL),
  aiApiBaseUrl: import.meta.env.DEV
    ? new URL('/__bada_ai', window.location.origin).toString()
    : configuredAiApiBaseUrl,
  voiceAuthMode: readVoiceAuthMode(import.meta.env.VITE_VOICE_AUTH_MODE),
} as const
