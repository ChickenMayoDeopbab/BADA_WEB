import type {
  DashboardMetricKey,
  DashboardMetricValue,
  DashboardOverview,
} from '@entities/dashboard'
import { WEEKDAY_LABELS, addDays, parseDateKey, toDateKey } from '@shared/lib'

export const weeklyMetrics: Array<{
  key: DashboardMetricKey
  label: string
  unit: '점' | '%' | 'ms'
  description: string
  colorClassName: string
}> = [
  {
    key: 'selfReportedAnxiety',
    label: '불안',
    unit: '점',
    description: '직접 입력한 불안 점수의 평균 (0~10점)',
    colorClassName: 'bg-metric-anxiety',
  },
  {
    key: 'tremorTurnRate',
    label: '떨림',
    unit: '%',
    description: '측정 가능한 발화 중 떨림 기준에 해당한 발화 비율',
    colorClassName: 'bg-metric-tremor',
  },
  {
    key: 'longPauseTurnRate',
    label: '긴 멈춤',
    unit: '%',
    description: '측정 가능한 발화 중 말 중간에 긴 멈춤이 있었던 발화 비율',
    colorClassName: 'bg-metric-pause',
  },
  {
    key: 'quietDropTurnRate',
    label: '음량 감소',
    unit: '%',
    description: '같은 통화의 평소 음량보다 작아진 발화 비율',
    colorClassName: 'bg-metric-quiet',
  },
  {
    key: 'fastRateTurnRate',
    label: '속도 증가',
    unit: '%',
    description: '같은 통화의 평소 속도보다 빨라진 발화 비율',
    colorClassName: 'bg-metric-fast',
  },
  {
    key: 'responseDelayMs',
    label: '응답 시간',
    unit: 'ms',
    description: '상대 발화 재생 완료부터 대답을 시작하기까지 걸린 평균 시간',
    colorClassName: 'bg-metric-delay',
  },
]

export interface WeeklyMetricDay {
  dateKey: string
  label: string
  metrics: Record<DashboardMetricKey, DashboardMetricValue | null>
}

/** 누락된 날짜와 아직 오지 않은 요일을 미측정 상태로 채우고 실제 0은 보존합니다. */
export const buildWeeklyMetricDays = (
  overview: DashboardOverview | undefined,
  today = new Date(),
): WeeklyMetricDay[] => {
  const weekStart = overview
    ? parseDateKey(overview.meta.period.from)
    : addDays(today, -((today.getDay() + 6) % 7))
  return Array.from({ length: 7 }, (_, index) => {
    const date = addDays(weekStart, index)
    const dateKey = toDateKey(date)
    const point = overview?.series.find(({ from, to }) => from === dateKey && to === dateKey)
    return {
      dateKey,
      label: WEEKDAY_LABELS[date.getDay()],
      metrics: Object.fromEntries(
        weeklyMetrics.map(({ key }) => [key, point?.metrics[key] ?? null]),
      ) as WeeklyMetricDay['metrics'],
    }
  })
}

/** 지표의 원래 단위와 미측정·표본 부족 상태를 표시합니다. */
export const formatWeeklyMetric = (
  metric: DashboardMetricValue | null | undefined,
  unit: string,
) => {
  if (!metric || metric.value === null || metric.status === 'NO_DATA') return '— (미측정)'
  const value = `${metric.value.toLocaleString('ko-KR', { maximumFractionDigits: 2 })}${unit}`
  return metric.status === 'INSUFFICIENT_DATA' ? `${value} (표본 부족)` : value
}

/** 점수와 비율은 고정 범위, 응답 시간은 해당 주의 최댓값을 기준으로 높이를 계산합니다. */
export const getWeeklyMetricBarHeight = (
  day: WeeklyMetricDay,
  key: DashboardMetricKey,
  days: WeeklyMetricDay[],
) => {
  const metric = day.metrics[key]
  if (!metric || metric.value === null || metric.status === 'NO_DATA') return 4
  const maximum =
    key === 'selfReportedAnxiety'
      ? 10
      : key === 'responseDelayMs'
        ? Math.max(1, ...days.map((item) => item.metrics[key]?.value ?? 0))
        : 100
  return Math.round(Math.min(1, Math.max(0, metric.value / maximum)) * 84)
}
