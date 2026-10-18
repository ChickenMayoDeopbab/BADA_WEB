import type { DashboardMetricComparison, DashboardMetricValue } from '@entities/dashboard'
import { weeklyMetrics } from './buildWeeklyMetricDays'
import { formatDashboardDelta } from './dashboardDetails'

type PeriodComparison = DashboardMetricComparison['overall']

/** 선택 지표의 평균을 원래 단위로 표시하고 측정값 0을 보존합니다. */
export const formatDashboardMetricValue = (
  metric: DashboardMetricValue | undefined,
  unit: string,
) =>
  !metric || metric.value === null || metric.status === 'NO_DATA'
    ? '—'
    : `${metric.value.toLocaleString('ko-KR', { maximumFractionDigits: 2 })}${unit}`

/** 비교 불가 사유를 숫자 변화로 오해하지 않도록 문장으로 설명합니다. */
export const getDashboardComparisonMessage = (comparison: PeriodComparison) => {
  if (comparison.status === 'NOT_COMPARABLE')
    return '두 기간의 기록을 같은 기준으로 비교할 수 없어요.'
  if (comparison.status === 'INSUFFICIENT_DATA')
    return '평균을 비교하기에는 측정된 훈련이 아직 적어요.'
  if (comparison.status === 'NO_DATA' || comparison.delta === null)
    return '두 기간 모두 측정된 기록이 있어야 변화를 확인할 수 있어요.'
  return null
}

/** 증감은 임상적 개선으로 해석하지 않고 실제 수치의 방향과 단위로 설명합니다. */
export const getDashboardMetricChange = (
  metric: DashboardMetricComparison,
  mode: 'overall' | 'matched',
) => {
  const comparison = metric[mode]
  if (getDashboardComparisonMessage(comparison)) return null
  const delta = comparison.delta!
  const definition = weeklyMetrics.find(({ key }) => key === metric.key)!
  if (delta === 0) return '이전과 같아요'
  const difference = formatDashboardDelta(Math.abs(delta), metric.deltaUnit).replace(/^\+/, '')
  if (definition.key === 'responseDelayMs')
    return `이전보다 ${difference} ${delta < 0 ? '짧아졌어요' : '길어졌어요'}`
  return `이전보다 ${difference} ${delta < 0 ? '낮아졌어요' : '높아졌어요'}`
}

/** 긴 날짜 키를 패널에서 읽기 쉬운 월·일 범위로 표시합니다. */
export const formatDashboardPeriod = (period: { from: string; to: string }) => {
  const hasDifferentYears = period.from.slice(0, 4) !== period.to.slice(0, 4)
  const start = hasDifferentYears
    ? period.from.replaceAll('-', '.')
    : period.from.slice(5).replace('-', '.')
  const end = hasDifferentYears
    ? period.to.replaceAll('-', '.')
    : period.to.slice(5).replace('-', '.')
  return period.from === period.to ? start : `${start} ~ ${end}`
}
