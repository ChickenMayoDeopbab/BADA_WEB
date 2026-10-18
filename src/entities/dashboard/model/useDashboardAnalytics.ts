import { useQuery } from '@tanstack/react-query'
import {
  getDashboardComparison,
  getDashboardOverview,
  getDashboardScenarios,
} from '../api/dashboardAnalyticsApi'
import type {
  DashboardComparisonQuery,
  DashboardQuery,
  DashboardScenariosQuery,
} from './analyticsTypes'

/** 기간과 조건을 캐시 키에 포함하여 통계 개요를 조회합니다. */
export const useDashboardOverview = (params: DashboardQuery, enabled = true) =>
  useQuery({
    queryKey: ['dashboard', 'overview', params],
    queryFn: () => getDashboardOverview(params),
    enabled,
  })

/** 요청한 두 기간의 비교 결과를 조회합니다. */
export const useDashboardComparison = (params: DashboardComparisonQuery, enabled = true) =>
  useQuery({
    queryKey: ['dashboard', 'comparison', params],
    queryFn: () => getDashboardComparison(params),
    enabled,
  })

/** 상황 목록의 페이지와 상세 추이를 독립적으로 캐시합니다. */
export const useDashboardScenarios = (params: DashboardScenariosQuery, enabled = true) =>
  useQuery({
    queryKey: ['dashboard', 'scenarios', params],
    queryFn: () => getDashboardScenarios(params),
    enabled,
  })
