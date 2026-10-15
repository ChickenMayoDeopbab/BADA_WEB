import { act, renderHook } from '@testing-library/react'
import { expect, it, vi } from 'vitest'
import { useFullRecording } from './useFullRecording'

it('상세 로딩 후 생긴 플레이어도 구간 재생·패널 닫기·언마운트 때 정지한다', () => {
  const { result, rerender, unmount } = renderHook(
    ({ segment, visible }) => useFullRecording(segment, visible, '/recording'),
    { initialProps: { segment: false, visible: false } },
  )
  const audio = document.createElement('audio')
  const pause = vi.fn()
  audio.pause = pause
  act(() => {
    result.current.current = audio
  })
  rerender({ segment: false, visible: true })
  rerender({ segment: true, visible: true })
  expect(pause).toHaveBeenCalledTimes(1)
  rerender({ segment: false, visible: false })
  expect(pause).toHaveBeenCalledTimes(2)
  unmount()
  expect(pause).toHaveBeenCalledTimes(3)
})
