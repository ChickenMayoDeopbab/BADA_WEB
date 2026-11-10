import type { PropsWithChildren } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import { AxiosError, type AxiosResponse } from 'axios'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { aiHttpClient } from '@shared/api'
import { useBiosignalReport } from './useBiosignalReport'

vi.mock('@shared/api', () => ({ aiHttpClient: { get: vi.fn() } }))

// 앱 기본값처럼 재시도가 켜진 QueryClient에서도 훅의 재시도 규칙을 따르는지 확인합니다.
const createWrapper = () => {
  const client = new QueryClient({ defaultOptions: { queries: { retry: 3 } } })
  return ({ children }: PropsWithChildren) => (
    <QueryClientProvider client={client}>{children}</QueryClientProvider>
  )
}

const httpError = (status: number) =>
  new AxiosError('Request failed', 'ERR_BAD_REQUEST', undefined, undefined, {
    status,
  } as AxiosResponse)

describe('useBiosignalReport', () => {
  beforeEach(() => {
    vi.mocked(aiHttpClient.get).mockReset()
  })

  it('세션 분석 결과를 AI 서버에서 조회해 카드 내용으로 바꾼다', async () => {
    vi.mocked(aiHttpClient.get).mockResolvedValue({
      data: {
        session_id: 'session/1',
        status: 'ANALYZED',
        metrics: {
          cardiac: {
            baseline: { status: 'MEASURED', value: 70, source: 'previous_sessions' },
            hr: { call_delta: { status: 'MEASURED', value: 1.2 } },
          },
        },
      },
    })

    const { result } = renderHook(() => useBiosignalReport('session/1'), {
      wrapper: createWrapper(),
    })

    await waitFor(() =>
      expect(result.current?.heart?.callChange).toBe('통화하는 동안 심박이 평소와 비슷했어요.'),
    )
    expect(aiHttpClient.get).toHaveBeenCalledWith('/api/v1/biosignals/session%2F1')
  })

  it.each([404, 403])('%i 응답은 다시 묻지 않고 카드를 숨긴다', async (status) => {
    vi.mocked(aiHttpClient.get).mockImplementation(() => Promise.reject(httpError(status)))

    const { result } = renderHook(() => useBiosignalReport('session-1'), {
      wrapper: createWrapper(),
    })

    await waitFor(() => expect(vi.mocked(aiHttpClient.get).mock.calls).toHaveLength(1))
    await new Promise((resolve) => setTimeout(resolve, 50))
    expect(vi.mocked(aiHttpClient.get).mock.calls).toHaveLength(1)
    expect(result.current).toBeNull()
  })

  it('측정하지 않는 통화는 조회하지 않는다', () => {
    renderHook(() => useBiosignalReport('session-1', false), { wrapper: createWrapper() })

    expect(aiHttpClient.get).not.toHaveBeenCalled()
  })
})
