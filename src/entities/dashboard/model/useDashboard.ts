import { getDashboardMetrics, getWeeklySummary } from '../api/dashboardApi'
import { useQuery } from '@tanstack/react-query'

const dashboardKeys = {
  weeklySummary: ['dashboard', 'weekly-summary'] as const,
  metrics: ['dashboard', 'metrics'] as const,
}

/** 이번 주 훈련 요약을 조회합니다. */
export const useWeeklySummary = () =>
  useQuery({
    queryKey: dashboardKeys.weeklySummary,
    queryFn: getWeeklySummary,
  })

/** 이번 주 날짜별 지표 점수를 조회합니다. */
export const useDashboardMetrics = () =>
  useQuery({
    queryKey: dashboardKeys.metrics,
    queryFn: getDashboardMetrics,
  })
