import { httpClient } from '@shared/api'
import type { ApiResponse } from '@shared/types'
import type {
  DashboardComparison,
  DashboardComparisonQuery,
  DashboardOverview,
  DashboardQuery,
  DashboardScenarios,
  DashboardScenariosQuery,
} from '../model/analyticsTypes'

/** 선택한 기간과 훈련 조건의 통계 개요를 조회합니다. */
export const getDashboardOverview = async (params: DashboardQuery) => {
  const { data } = await httpClient.get<ApiResponse<DashboardOverview>>(
    '/api/v1/dashboard/overview',
    { params },
  )
  return data.data
}

/** 전체 표본 및 동일 조건 표본으로 이전 기간과 비교합니다. */
export const getDashboardComparison = async (params: DashboardComparisonQuery) => {
  const { data } = await httpClient.get<ApiResponse<DashboardComparison>>(
    '/api/v1/dashboard/comparison',
    { params },
  )
  return data.data
}

/** 상황별 통계 목록과 선택한 상황의 추이를 조회합니다. */
export const getDashboardScenarios = async (params: DashboardScenariosQuery) => {
  const { data } = await httpClient.get<ApiResponse<DashboardScenarios>>(
    '/api/v1/dashboard/scenarios',
    { params },
  )
  return data.data
}
