import type { DashboardMetrics, WeeklySummary } from '../model/types'
import { httpClient } from '@shared/api'
import type { ApiResponse } from '@shared/types'

/** 이번 주 훈련 요약을 조회합니다. */
export const getWeeklySummary = async () => {
  const { data } = await httpClient.get<ApiResponse<WeeklySummary>>(
    '/api/v1/dashboard/weekly-summary',
  )

  return data.data
}

/** 이번 주 날짜별 안정도·대화 유지·유창성 점수를 조회합니다. */
export const getDashboardMetrics = async () => {
  const { data } = await httpClient.get<ApiResponse<DashboardMetrics>>('/api/v1/dashboard/metrics')

  return data.data
}
