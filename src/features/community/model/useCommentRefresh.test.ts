import { useCommentRefresh } from './useCommentRefresh'
import { act, cleanup, renderHook } from '@testing-library/react'
import { afterEach, expect, it, vi } from 'vitest'

afterEach(cleanup)

it('느린 조회 중 회전을 유지하고 완료 후 다음 한 바퀴 경계에서 멈춘다', async () => {
  let finish!: () => void
  const refresh = vi.fn(
    () =>
      new Promise<void>((resolve) => {
        finish = resolve
      }),
  )
  const { result } = renderHook(() => useCommentRefresh(refresh))
  act(() => {
    void result.current.handleRefresh()
  })
  act(() => {
    void result.current.handleRefresh()
  })
  expect(refresh).toHaveBeenCalledOnce()
  act(() => result.current.handleRotationComplete())
  expect(result.current.isRefreshing).toBe(true)
  await act(async () => finish())
  expect(result.current.isRefreshing).toBe(true)
  act(() => result.current.handleRotationComplete())
  expect(result.current.isRefreshing).toBe(false)
})
