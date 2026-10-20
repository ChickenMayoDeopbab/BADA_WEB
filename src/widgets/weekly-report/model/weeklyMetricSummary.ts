import type { DashboardMetricValue, DashboardOverview } from '@entities/dashboard'
import { weeklyMetrics } from './buildWeeklyMetricDays'
import { formatDashboardMetricValue } from './dashboardMetricPresentation'

/** 지표 설명에는 측정 여부와 평균 계산에 사용한 훈련 횟수를 풀어서 표시합니다. */
export const describeWeeklyMeasurement = (
  label: string,
  unit: string,
  measurement: DashboardMetricValue | null | undefined,
) => {
  const value = formatDashboardMetricValue(measurement ?? undefined, unit)
  if (value === '—') return `${label} · 측정 기록 없음`
  return `${label} ${value} · ${measurement!.sampleCount}회 훈련으로 계산${measurement!.status === 'INSUFFICIENT_DATA' ? ' · 아직 훈련 기록이 적어요' : ''}`
}

/** 주간 평균은 숫자 중심으로 구성하고 측정 상태 안내는 한 줄로 모읍니다. */
export const buildWeeklyMetricSummary = (overview: DashboardOverview | undefined) => {
  const items = weeklyMetrics.map((definition) => {
    const measurement = overview?.metrics[definition.key]
    const value = formatDashboardMetricValue(measurement, definition.unit)
    return {
      ...definition,
      value,
      isMissing: value === '—',
      description: `${definition.description} · ${describeWeeklyMeasurement(definition.label, definition.unit, measurement)}`,
      hasLimitedData: value !== '—' && measurement?.status === 'INSUFFICIENT_DATA',
    }
  })
  if (!overview) return { items, notice: '' }
  if (items.every(({ isMissing }) => isMissing))
    return { items, notice: '이번 주 측정된 지표가 아직 없어요.' }
  const notes = [
    items.some(({ isMissing }) => isMissing) ? '— 측정 기록 없음' : null,
    items.some(({ hasLimitedData }) => hasLimitedData) ? '적은 훈련으로 계산한 평균이에요.' : null,
  ].filter(Boolean)
  return { items, notice: notes.join(' · ') || '이번 주 훈련의 평균이에요.' }
}
