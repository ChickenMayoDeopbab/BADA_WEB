import { describe, expect, it } from 'vitest'
import { pickLatestBiosignalSession } from './latestBiosignalSession'

describe('pickLatestBiosignalSession', () => {
  it('모든 조건 묶음에서 가장 최근에 분석된 통화를 고른다', () => {
    expect(
      pickLatestBiosignalSession({
        sessions: 3,
        groups: [
          {
            sessions: [
              { session_id: 'a', at: '2026-11-08T01:00:00+00:00' },
              { session_id: 'c', at: '2026-11-10T00:25:00+00:00' },
            ],
          },
          { sessions: [{ session_id: 'b', at: '2026-11-09T01:00:00+00:00' }] },
        ],
      }),
    ).toEqual({ sessionId: 'c', at: '2026-11-10T00:25:00+00:00' })
  })

  it('측정 기록이 없거나 형식이 맞지 않으면 null이다', () => {
    expect(pickLatestBiosignalSession({ sessions: 0, groups: [] })).toBeNull()
    expect(pickLatestBiosignalSession({})).toBeNull()
    expect(pickLatestBiosignalSession(undefined)).toBeNull()
    expect(
      pickLatestBiosignalSession({ groups: [{ sessions: [{ session_id: 'a', at: 'invalid' }] }] }),
    ).toBeNull()
  })
})
