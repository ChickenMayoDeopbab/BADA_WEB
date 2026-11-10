import type { BiosignalLatestSession, BiosignalTrendResponse } from './types'

/** 추세 응답의 모든 묶음에서 가장 최근에 분석된 통화를 고릅니다. 없으면 null입니다. */
export const pickLatestBiosignalSession = (
  trend: BiosignalTrendResponse | undefined,
): BiosignalLatestSession | null => {
  const groups = Array.isArray(trend?.groups) ? trend.groups : []
  let latest: (BiosignalLatestSession & { time: number }) | null = null
  for (const group of groups) {
    for (const session of Array.isArray(group?.sessions) ? group.sessions : []) {
      const time = typeof session?.at === 'string' ? Date.parse(session.at) : Number.NaN
      if (typeof session?.session_id !== 'string' || !Number.isFinite(time)) continue
      if (!latest || time > latest.time) {
        latest = { sessionId: session.session_id, at: session.at as string, time }
      }
    }
  }

  return latest && { sessionId: latest.sessionId, at: latest.at }
}
