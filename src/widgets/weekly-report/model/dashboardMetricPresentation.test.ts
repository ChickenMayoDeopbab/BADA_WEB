import { describe, expect, it } from 'vitest'
import type { DashboardMetricComparison, DashboardMetricValue } from '@entities/dashboard'
import {
  formatDashboardMetricValue,
  formatDashboardPeriod,
  getDashboardComparisonMessage,
  getDashboardMetricChange,
} from './dashboardMetricPresentation'

const value: DashboardMetricValue = {
  value: 0,
  unit: 'PERCENT',
  aggregation: 'MEAN_OF_SESSION_RATES',
  sampleCount: 3,
  eligibleTurnCount: 10,
  status: 'READY',
  exclusionReasons: {},
}
const comparison = {
  baseline: { ...value, value: 20 },
  current: value,
  delta: -20,
  status: 'READY' as const,
}
const metric: DashboardMetricComparison = {
  key: 'tremorTurnRate',
  unit: 'PERCENT',
  deltaUnit: 'PERCENTAGE_POINT',
  overall: comparison,
  matched: { ...comparison, conditionCount: 1, conditions: [] },
}

// 원래 단위와 결측 상태를 유지하며 수치 변화를 설명하는지 검증합니다.
describe('dashboard metric presentation', () => {
  it('실제 0과 미측정 값을 구분한다', () => {
    expect(formatDashboardMetricValue(value, '%')).toBe('0%')
    expect(formatDashboardMetricValue({ ...value, value: null }, '%')).toBe('—')
    expect(formatDashboardMetricValue({ ...value, status: 'NO_DATA' }, '%')).toBe('—')
  })
  it('비율 차이는 %p로 표시하고 감소를 개선으로 단정하지 않는다', () => {
    expect(getDashboardMetricChange(metric, 'overall')).toBe('이전보다 20%p 낮아졌어요')
    expect(
      getDashboardMetricChange({ ...metric, overall: { ...comparison, delta: 5 } }, 'overall'),
    ).toBe('이전보다 5%p 높아졌어요')
    expect(
      getDashboardMetricChange({ ...metric, overall: { ...comparison, delta: 0 } }, 'overall'),
    ).toBe('이전과 같아요')
  })
  it('응답 시간과 점수는 각 단위로 설명한다', () => {
    expect(
      getDashboardMetricChange(
        { ...metric, key: 'responseDelayMs', deltaUnit: 'MILLISECOND' },
        'overall',
      ),
    ).toBe('이전보다 20ms 짧아졌어요')
    expect(
      getDashboardMetricChange(
        {
          ...metric,
          key: 'selfReportedAnxiety',
          deltaUnit: 'POINT',
          overall: { ...comparison, delta: -2 },
        },
        'overall',
      ),
    ).toBe('이전보다 2점 낮아졌어요')
  })
  it.each(['INSUFFICIENT_DATA', 'NO_DATA', 'NOT_COMPARABLE'] as const)(
    '계산할 수 없는 %s 상태에서는 증감을 표시하지 않는다',
    (status) => {
      const unavailable = { ...comparison, status }
      expect(getDashboardComparisonMessage(unavailable)).not.toBeNull()
      expect(getDashboardMetricChange({ ...metric, overall: unavailable }, 'overall')).toBeNull()
    },
  )
  it('다른 연도를 구분하고 단일 날짜는 중복하지 않는다', () => {
    expect(formatDashboardPeriod({ from: '2026-10-01', to: '2026-10-18' })).toBe('10.01 ~ 10.18')
    expect(formatDashboardPeriod({ from: '2025-12-31', to: '2026-01-02' })).toBe(
      '2025.12.31 ~ 2026.01.02',
    )
    expect(formatDashboardPeriod({ from: '2026-10-01', to: '2026-10-01' })).toBe('10.01')
  })
})
