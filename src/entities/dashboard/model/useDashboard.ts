import { getDashboardMetrics } from '../api/dashboardApi'
import { useDashboardOverview } from './useDashboardAnalytics'
import { getDashboardWeekQuery, toWeeklySummary } from './weeklyOverview'
import { useQuery } from '@tanstack/react-query'

const dashboardKeys = {
  metrics: ['dashboard', 'metrics'] as const,
}

/** 주간 차트와 요약에서 같은 개요 요청 및 캐시를 공유합니다. */
export const useWeeklyDashboardOverview = () => useDashboardOverview(getDashboardWeekQuery())

/** 개요 API의 훈련 횟수·시간·상황 경험을 기존 주간 요약에 연결합니다. */
export const useWeeklySummary = () => {
  const query = useWeeklyDashboardOverview()
  return { ...query, data: query.data ? toWeeklySummary(query.data) : undefined }
}

/** 이번 주 날짜별 지표 점수를 조회합니다. */
export const useDashboardMetrics = () =>
  useQuery({
    queryKey: dashboardKeys.metrics,
    queryFn: getDashboardMetrics,
  })
