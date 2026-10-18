import {
  buildWeeklyMetricDays,
  formatWeeklyMetric,
  getWeeklyMetricBarHeight,
} from './buildWeeklyMetricDays'
import type { DashboardMetricValue, DashboardOverview } from '@entities/dashboard'
import { describe, expect, it } from 'vitest'

const measured: DashboardMetricValue = {
  value: 0,
  unit: 'PERCENT',
  aggregation: 'MEAN_OF_SESSION_RATES',
  sampleCount: 3,
  eligibleTurnCount: 9,
  status: 'READY',
  exclusionReasons: {},
}
const missing: DashboardMetricValue = {
  ...measured,
  value: null,
  sampleCount: 0,
  status: 'NO_DATA',
}
const metrics = {
  selfReportedAnxiety: { ...measured, value: 4, unit: 'SCORE_0_10' },
  tremorTurnRate: measured,
  longPauseTurnRate: missing,
  quietDropTurnRate: { ...measured, value: 25 },
  fastRateTurnRate: { ...measured, value: 10, status: 'INSUFFICIENT_DATA' as const },
  responseDelayMs: { ...measured, value: 800, unit: 'MILLISECOND' },
}
const overview: DashboardOverview = {
  meta: {
    period: { from: '2026-10-12', to: '2026-10-14', isPartial: true },
    baseline: null,
    interval: 'DAY',
    filters: {
      sessionType: null,
      scenarioId: null,
      scenarioVersion: null,
      difficulty: null,
      aiPersonality: null,
      scriptLevel: null,
    },
    timeZone: 'Asia/Seoul',
    generatedAt: '2026-10-14T10:00:00Z',
    aggregationPolicyVersion: '1',
  },
  summary: { trainingCount: 3, trainingDays: 1, totalDurationSeconds: 120, warmupCount: 1 },
  experience: { scenarioCount: 2, newScenarioCount: 1, unknownScenarioTrainingCount: 0 },
  hintSettings: { '1': 3 },
  metrics,
  series: [{ from: '2026-10-12', to: '2026-10-12', isPartial: false, trainingCount: 3, metrics }],
  activity: [{ date: '2026-10-12', trainingCount: 3 }],
  coverage: {
    trainingCount: 3,
    selfReportCount: 3,
    metricSampleCounts: {
      selfReportedAnxiety: 3,
      tremorTurnRate: 3,
      longPauseTurnRate: 0,
      quietDropTurnRate: 3,
      fastRateTurnRate: 1,
      responseDelayMs: 3,
    },
  },
}

// 원래 점수 3개 대신 새 지표 6개의 값과 단위를 그대로 사용합니다.
describe('weekly overview metrics', () => {
  it('월요일부터 일요일까지 채우며 측정한 0과 누락 날짜를 구분한다', () => {
    const days = buildWeeklyMetricDays(overview)
    expect(days.map(({ label }) => label)).toEqual(['월', '화', '수', '목', '금', '토', '일'])
    expect(days[0].metrics.tremorTurnRate?.value).toBe(0)
    expect(days[0].metrics.longPauseTurnRate?.value).toBeNull()
    expect(Object.values(days[1].metrics)).toEqual(Array(6).fill(null))
    expect(days[6].dateKey).toBe('2026-10-18')
  })

  it('점수·비율·시간을 각각의 기준으로 그리면서 원래 값은 바꾸지 않는다', () => {
    const days = buildWeeklyMetricDays(overview)
    expect(getWeeklyMetricBarHeight(days[0], 'selfReportedAnxiety', days)).toBe(34)
    expect(getWeeklyMetricBarHeight(days[0], 'quietDropTurnRate', days)).toBe(21)
    expect(getWeeklyMetricBarHeight(days[0], 'responseDelayMs', days)).toBe(84)
    expect(getWeeklyMetricBarHeight(days[0], 'tremorTurnRate', days)).toBe(0)
    expect(getWeeklyMetricBarHeight(days[0], 'longPauseTurnRate', days)).toBe(4)
    expect(days[0].metrics.responseDelayMs?.value).toBe(800)
  })

  it('평균에 0·미측정·표본 부족을 구분하여 표시한다', () => {
    expect(formatWeeklyMetric(measured, '%')).toBe('0%')
    expect(formatWeeklyMetric(missing, '%')).toBe('— (미측정)')
    expect(formatWeeklyMetric(metrics.responseDelayMs, 'ms')).toBe('800ms')
    expect(formatWeeklyMetric(metrics.fastRateTurnRate, '%')).toBe('10% (표본 부족)')
  })

  it('아직 데이터가 없으면 이번 주의 빈 요일을 구성한다', () => {
    const days = buildWeeklyMetricDays(undefined, new Date(2026, 9, 14))
    expect(days[0].dateKey).toBe('2026-10-12')
    expect(days[6].dateKey).toBe('2026-10-18')
  })
})
