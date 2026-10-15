import { useToast } from './useToast'
import { act, cleanup, renderHook } from '@testing-library/react'
import { afterEach, expect, it, vi } from 'vitest'

afterEach(() => {
  cleanup()
  vi.useRealTimers()
})

it('완료 메시지는 3초 뒤 사라지고 새 메시지는 표시 시간을 다시 시작한다', () => {
  vi.useFakeTimers()
  const { result, unmount } = renderHook(useToast)
  act(() => result.current.showToast('접수되었습니다.'))
  act(() => {
    vi.advanceTimersByTime(2000)
  })
  act(() => result.current.showToast('다음 신고가 접수되었습니다.'))
  act(() => {
    vi.advanceTimersByTime(2000)
  })
  expect(result.current.message).toBe('다음 신고가 접수되었습니다.')
  act(() => {
    vi.advanceTimersByTime(1000)
  })
  expect(result.current.message).toBe('')
  act(() => result.current.showToast('정리할 메시지'))
  unmount()
  expect(vi.getTimerCount()).toBe(0)
})
