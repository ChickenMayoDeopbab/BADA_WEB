import { formatTrainingRecord } from './formatTrainingRecord'
import { describe, expect, it } from 'vitest'

describe('formatTrainingRecord', () => {
  it('formats the session type, duration, and trained date', () => {
    expect(
      formatTrainingRecord({
        recordId: 1,
        sessionId: 'session-1',
        trainedAt: '2026-09-03T14:20:00',
        scenarioName: '음식점 예약',
        sessionType: 'SCENARIO',
        durationSeconds: 37,
      }),
    ).toEqual({ id: 1, trainedAt: '2026-09-03T14:20:00', title: '음식점 예약', meta: '시나리오 · 37초', date: '9/3' })
  })
})
