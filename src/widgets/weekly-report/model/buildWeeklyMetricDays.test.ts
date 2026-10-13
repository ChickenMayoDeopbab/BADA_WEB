import { buildWeeklyMetricDays } from './buildWeeklyMetricDays'
import type { DashboardMetrics } from '@entities/dashboard'
import { describe, expect, it } from 'vitest'

const metrics: DashboardMetrics = {
  weekStart: '2025-09-01',
  weekEnd: '2025-09-07',
  dates: ['2025-09-01', '2025-09-03'],
  stabilityScores: [62, 74],
  conversationScores: [64, 0],
  fluencyScores: [88, 120],
  callPhobiaLevel: null,
}

describe('buildWeeklyMetricDays', () => {
  it('maps scores to Monday through Sunday and leaves missing days empty', () => {
    const days = buildWeeklyMetricDays(metrics)

    expect(days.map(({ label }) => label)).toEqual(['월', '화', '수', '목', '금', '토', '일'])
    expect(days[0].scores).toEqual({ stability: 62, conversation: 64, fluency: 88 })
    expect(days[1].scores).toEqual({ stability: null, conversation: null, fluency: null })
    expect(days[2].scores).toEqual({ stability: 74, conversation: null, fluency: 100 })
  })

  it('falls back to the current week when metrics are unavailable', () => {
    const days = buildWeeklyMetricDays(undefined, new Date(2025, 8, 4))

    expect(days[0].dateKey).toBe('2025-09-01')
    expect(days[6].dateKey).toBe('2025-09-07')
  })
})
