import type { ScenarioRouteState } from '@entities/scenario'

const unavailableCalls = new Set<string>()
const storagePrefix = 'bada.unavailableCall.'

/** 같은 통화의 history state 갱신은 마이크와 WebSocket을 다시 생성하지 않습니다. */
export const getScenarioCallRouteKey = (state: ScenarioRouteState | null, locationKey: string) =>
  state?.callId ??
  (state?.schedule
    ? `schedule-${state.schedule.scheduleId}`
    : state?.session
      ? `session-${state.session.sessionId}`
      : locationKey)

/** 페이지 이동·새로고침 이후에는 이미 시작하거나 폐기한 세션을 재사용하지 않습니다. */
export const isCallUnavailable = (callId: string, sessionId?: string) =>
  [callId, ...(sessionId ? [`session-${sessionId}`] : [])].some((key) => {
    if (unavailableCalls.has(key)) return true
    try {
      return sessionStorage.getItem(`${storagePrefix}${key}`) === 'true'
    } catch {
      return false
    }
  })

/** 인증 정보 없이 사용한 통화 식별자만 탭에 보관합니다. 저장 차단 시 메모리를 사용합니다. */
export const markCallUnavailable = (callId: string, sessionId?: string) => {
  for (const key of [callId, ...(sessionId ? [`session-${sessionId}`] : [])]) {
    unavailableCalls.add(key)
    try {
      sessionStorage.setItem(`${storagePrefix}${key}`, 'true')
    } catch {
      // 저장소가 차단되어도 현재 문서의 뒤로·앞으로 이동은 보호합니다.
    }
  }
}

/** URL과 이전 화면에서 받은 시나리오가 다른 세션은 연결하지 않습니다. */
export const hasMatchingCallScenario = (scenarioId: string, state: ScenarioRouteState | null) => {
  if (scenarioId === 'scheduled') return Boolean(state?.schedule)
  const id = Number(scenarioId)
  return (
    Number.isSafeInteger(id) &&
    id > 0 &&
    (!state?.scenario || state.scenario.scenarioId === id) &&
    (!state?.sessionConfiguration || state.sessionConfiguration.scenarioId === id)
  )
}
