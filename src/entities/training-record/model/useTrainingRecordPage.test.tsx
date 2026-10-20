import type { PropsWithChildren } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { httpClient } from '@shared/api'
import { useTrainingRecordPage } from './useTrainingRecordPage'
import type { TrainingRecordPageParams } from './types'

vi.mock('@shared/api', () => ({ httpClient: { get: vi.fn() } }))

/** 새 조건을 이전 페이지의 캐시와 구분하는 실제 QueryClient를 제공합니다. */
const createWrapper = () => {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false, staleTime: 60_000 } },
  })
  return ({ children }: PropsWithChildren) => (
    <QueryClientProvider client={client}>{children}</QueryClientProvider>
  )
}

// 같은 페이지에서도 기간과 훈련 조건이 달라지면 새 기록을 조회해야 합니다.
describe('useTrainingRecordPage', () => {
  beforeEach(() => vi.mocked(httpClient.get).mockReset())

  it('같은 페이지의 상황 필터를 바꿔도 이전 상황의 기록을 재사용하지 않는다', async () => {
    vi.mocked(httpClient.get)
      .mockResolvedValueOnce({ data: { data: { content: [{ recordId: 7 }] } } })
      .mockResolvedValueOnce({ data: { data: { content: [{ recordId: 8 }] } } })
    const { result, rerender } = renderHook(
      (params: TrainingRecordPageParams) => useTrainingRecordPage(params),
      { initialProps: { page: 0, size: 5, scenarioId: 7 }, wrapper: createWrapper() },
    )
    await waitFor(() => expect(result.current.data?.content[0].recordId).toBe(7))
    rerender({ page: 0, size: 5, scenarioId: 8 })
    await waitFor(() => expect(result.current.data?.content[0].recordId).toBe(8))
    expect(httpClient.get).toHaveBeenLastCalledWith('/api/v1/training-records', {
      params: { page: 0, size: 5, scenarioId: 8 },
    })
  })

  it('기간과 힌트 단계를 캐시에 포함하고 원래 조건으로 돌아오면 해당 결과를 사용한다', async () => {
    vi.mocked(httpClient.get)
      .mockResolvedValueOnce({ data: { data: { content: [{ recordId: 1 }] } } })
      .mockResolvedValueOnce({ data: { data: { content: [{ recordId: 2 }] } } })
    const first = { from: '2026-10-01', to: '2026-10-07', scriptLevel: 1 }
    const second = { from: '2026-10-08', to: '2026-10-14', scriptLevel: 2 }
    const { result, rerender } = renderHook(
      (params: TrainingRecordPageParams) => useTrainingRecordPage(params),
      { initialProps: first, wrapper: createWrapper() },
    )
    await waitFor(() => expect(result.current.data?.content[0].recordId).toBe(1))
    rerender(second)
    await waitFor(() => expect(result.current.data?.content[0].recordId).toBe(2))
    rerender(first)
    await waitFor(() => expect(result.current.data?.content[0].recordId).toBe(1))
    expect(httpClient.get).toHaveBeenCalledTimes(2)
  })
})
