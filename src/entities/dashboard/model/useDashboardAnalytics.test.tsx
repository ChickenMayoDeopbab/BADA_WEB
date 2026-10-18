import type { PropsWithChildren } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { httpClient } from '@shared/api'
import {
  useDashboardComparison,
  useDashboardOverview,
  useDashboardScenarios,
} from './useDashboardAnalytics'
import type { DashboardQuery, DashboardScenariosQuery } from './analyticsTypes'

vi.mock('@shared/api', () => ({ httpClient: { get: vi.fn() } }))

/** 조건별 캐시와 선택적 조회를 실제 QueryClient에서 검증합니다. */
const createWrapper = () => {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false, staleTime: 60_000 } },
  })
  return ({ children }: PropsWithChildren) => (
    <QueryClientProvider client={client}>{children}</QueryClientProvider>
  )
}

const period: DashboardQuery = { from: '2026-10-01', to: '2026-10-14', interval: 'DAY' }

// 화면 없이 조회 훅의 데이터 보존과 캐시 분리를 검증합니다.
describe('dashboard analytics queries', () => {
  beforeEach(() => vi.mocked(httpClient.get).mockReset())

  it('측정한 0과 미측정 null을 보존하고 기간 변경 시 새 결과를 조회한다', async () => {
    const first = {
      metrics: { selfReportedAnxiety: { value: 0 }, responseDelayMs: { value: null } },
    }
    const second = { metrics: { selfReportedAnxiety: { value: 2 } } }
    vi.mocked(httpClient.get)
      .mockResolvedValueOnce({ data: { data: first } })
      .mockResolvedValueOnce({ data: { data: second } })
    const { result, rerender } = renderHook(
      (params: DashboardQuery) => useDashboardOverview(params),
      { initialProps: period, wrapper: createWrapper() },
    )
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data?.metrics.selfReportedAnxiety.value).toBe(0)
    expect(result.current.data?.metrics.responseDelayMs.value).toBeNull()
    rerender({ ...period, from: '2026-10-08' })
    await waitFor(() => expect(result.current.data?.metrics.selfReportedAnxiety.value).toBe(2))
    expect(httpClient.get).toHaveBeenCalledTimes(2)
  })

  it('비교 조회를 활성화하기 전에는 요청하지 않고 서버의 비교 불가 상태를 보존한다', async () => {
    const data = {
      metrics: [{ key: 'tremorTurnRate', matched: { status: 'NOT_COMPARABLE', delta: null } }],
    }
    vi.mocked(httpClient.get).mockResolvedValue({ data: { data } })
    const { result, rerender } = renderHook(
      (enabled: boolean) => useDashboardComparison(period, enabled),
      { initialProps: false, wrapper: createWrapper() },
    )
    expect(httpClient.get).not.toHaveBeenCalled()
    rerender(true)
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data?.metrics[0].matched).toEqual({
      status: 'NOT_COMPARABLE',
      delta: null,
    })
  })

  it('상황 목록 페이지와 같은 상황의 추이를 별도 조회한다', async () => {
    vi.mocked(httpClient.get)
      .mockResolvedValueOnce({
        data: { data: { items: [{ scenarioId: 7, series: [] }], page: 1 } },
      })
      .mockResolvedValueOnce({
        data: { data: { items: [{ scenarioId: 7, series: [{ from: period.from }] }], page: 0 } },
      })
    const initialParams: DashboardScenariosQuery = { ...period, page: 1, size: 5 }
    const { result, rerender } = renderHook(
      (params: DashboardScenariosQuery) => useDashboardScenarios(params),
      { initialProps: initialParams, wrapper: createWrapper() },
    )
    await waitFor(() => expect(result.current.data?.page).toBe(1))
    rerender({
      ...period,
      page: 0,
      size: 1,
      scenarioId: 7,
      sessionType: 'CUSTOM',
      includeSeries: true,
    })
    await waitFor(() => expect(result.current.data?.items[0].series).toHaveLength(1))
    expect(httpClient.get).toHaveBeenLastCalledWith('/api/v1/dashboard/scenarios', {
      params: {
        ...period,
        page: 0,
        size: 1,
        scenarioId: 7,
        sessionType: 'CUSTOM',
        includeSeries: true,
      },
    })
  })
})
