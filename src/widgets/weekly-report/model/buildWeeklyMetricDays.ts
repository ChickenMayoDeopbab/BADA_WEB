import type { DashboardMetrics } from '@entities/dashboard'
import { WEEKDAY_LABELS, addDays, parseDateKey, toDateKey } from '@shared/lib'

export const METRIC_MAX_SCORE = 100

export type MetricKey = 'stability' | 'conversation' | 'fluency'

export interface WeeklyMetricDay {
  dateKey: string
  label: string
  scores: Record<MetricKey, number | null>
}

// 오늘이 속한 주의 월요일을 반환합니다.
const getMondayOfWeek = (date: Date) => addDays(date, -((date.getDay() + 6) % 7))

/** 주간 지표 응답을 월요일부터 일요일까지 7일의 점수 목록으로 변환합니다. 기록이 없는 날은 null입니다. */
export const buildWeeklyMetricDays = (
  metrics: DashboardMetrics | undefined,
  today = new Date(),
): WeeklyMetricDay[] => {
  const weekStart = metrics ? parseDateKey(metrics.weekStart) : getMondayOfWeek(today)

  return Array.from({ length: 7 }, (_, index) => {
    const date = addDays(weekStart, index)
    const dateKey = toDateKey(date)
    const scoreIndex = metrics?.dates.indexOf(dateKey) ?? -1
    const readScore = (scores: number[] | undefined) => {
      const score = scoreIndex >= 0 ? scores?.[scoreIndex] : undefined

      return typeof score === 'number' && score > 0 ? Math.min(score, METRIC_MAX_SCORE) : null
    }

    return {
      dateKey,
      label: WEEKDAY_LABELS[date.getDay()],
      scores: {
        stability: readScore(metrics?.stabilityScores),
        conversation: readScore(metrics?.conversationScores),
        fluency: readScore(metrics?.fluencyScores),
      },
    }
  })
}
