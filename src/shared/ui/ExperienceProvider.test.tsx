import { act, cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, expect, it, vi } from 'vitest'
import { ExperienceProvider } from './ExperienceProvider'
import { useToast, type ToastMessage } from './toastContext'

const flags = vi.hoisted(() => ({ toasts: true }))
vi.mock('@shared/config', async (importOriginal) => {
  const original = await importOriginal<typeof import('@shared/config')>()
  return {
    ...original,
    experienceConfig: {
      ...original.experienceConfig,
      get toasts() {
        return flags.toasts
      },
    },
  }
})

/** 공통 토스트가 요청 옵션과 전역 설정을 함께 적용하는지 확인합니다. */
const ToastAction = ({ toast }: { toast: ToastMessage }) => {
  const notify = useToast()
  return <button onClick={() => notify(toast)}>완료 알림</button>
}

/** 실제 전역 Provider를 통해 작업 결과를 표시합니다. */
const renderToast = (toast: ToastMessage) =>
  render(
    <ExperienceProvider>
      <ToastAction toast={toast} />
    </ExperienceProvider>,
  )

afterEach(() => {
  cleanup()
  flags.toasts = true
  vi.useRealTimers()
})

it('2.5초 진행 막대가 끝나면 퇴장 상태로 바뀌고 애니메이션 후 제거한다', () => {
  vi.useFakeTimers()
  renderToast({ message: '신고가 접수되었습니다.', position: 'top-right' })
  fireEvent.click(screen.getByRole('button', { name: '완료 알림' }))
  fireEvent.click(screen.getByRole('button', { name: '완료 알림' }))
  expect(screen.getAllByRole('status')).toHaveLength(1)
  const toast = screen.getByRole('status').parentElement!
  expect(toast.querySelector('[data-toast-progress]')).toHaveStyle({ animationDuration: '2500ms' })
  act(() => vi.advanceTimersByTime(2499))
  expect(toast).toHaveAttribute('data-toast-state', 'visible')
  act(() => vi.advanceTimersByTime(1))
  expect(toast).toHaveAttribute('data-toast-state', 'exiting')
  act(() => vi.advanceTimersByTime(280))
  expect(screen.queryByRole('status')).not.toBeInTheDocument()
})

it('개별 표시 시간 옵션도 진행 막대와 자동 닫힘에 함께 적용한다', () => {
  vi.useFakeTimers()
  renderToast({ message: '저장했어요.', duration: 1000 })
  fireEvent.click(screen.getByRole('button', { name: '완료 알림' }))
  const toast = screen.getByRole('status').parentElement!
  expect(toast.querySelector('[data-toast-progress]')).toHaveStyle({ animationDuration: '1000ms' })
  act(() => vi.advanceTimersByTime(1000))
  expect(toast).toHaveAttribute('data-toast-state', 'exiting')
  act(() => vi.advanceTimersByTime(280))
  expect(screen.queryByRole('status')).not.toBeInTheDocument()
})

it('전역 토스트를 끄면 위치·유지 시간 옵션이 있어도 표시하지 않는다', () => {
  flags.toasts = false
  renderToast({ message: '신고가 접수되었습니다.', position: 'top-right' })
  fireEvent.click(screen.getByRole('button', { name: '완료 알림' }))
  expect(screen.queryByRole('status')).not.toBeInTheDocument()
})

it('호버와 포커스 중에는 멈추고 남은 시간부터 재개한다', () => {
  vi.useFakeTimers()
  renderToast({ message: '저장했어요.' })
  fireEvent.click(screen.getByRole('button', { name: '완료 알림' }))
  const toast = screen.getByRole('status').parentElement!
  act(() => vi.advanceTimersByTime(1000))
  fireEvent.mouseEnter(toast)
  fireEvent.focus(screen.getByRole('button', { name: '알림 닫기' }))
  act(() => vi.advanceTimersByTime(5000))
  expect(toast.querySelector('[data-toast-progress]')).toHaveStyle({ animationPlayState: 'paused' })
  fireEvent.mouseLeave(toast)
  act(() => vi.advanceTimersByTime(1000))
  expect(toast).toHaveAttribute('data-toast-state', 'visible')
  fireEvent.blur(screen.getByRole('button', { name: '알림 닫기' }))
  act(() => vi.advanceTimersByTime(1499))
  expect(toast).toHaveAttribute('data-toast-state', 'visible')
  act(() => vi.advanceTimersByTime(1))
  expect(toast).toHaveAttribute('data-toast-state', 'exiting')
  act(() => vi.advanceTimersByTime(280))
  expect(screen.queryByRole('status')).not.toBeInTheDocument()
})

it('수동 닫기도 퇴장 효과를 거치고 언마운트 시 타이머를 정리한다', () => {
  vi.useFakeTimers()
  const view = renderToast({ message: '저장했어요.' })
  fireEvent.click(screen.getByRole('button', { name: '완료 알림' }))
  fireEvent.click(screen.getByRole('button', { name: '알림 닫기' }))
  expect(screen.getByRole('status').parentElement).toHaveAttribute('data-toast-state', 'exiting')
  act(() => vi.advanceTimersByTime(280))
  expect(screen.queryByRole('status')).not.toBeInTheDocument()
  fireEvent.click(screen.getByRole('button', { name: '완료 알림' }))
  view.unmount()
  expect(vi.getTimerCount()).toBe(0)
})

it('동작 줄이기 환경에서는 퇴장 애니메이션 대기 없이 제거한다', () => {
  vi.useFakeTimers()
  vi.stubGlobal('matchMedia', () => ({ matches: true }))
  renderToast({ message: '저장했어요.' })
  fireEvent.click(screen.getByRole('button', { name: '완료 알림' }))
  act(() => vi.advanceTimersByTime(2500))
  act(() => vi.runOnlyPendingTimers())
  expect(screen.queryByRole('status')).not.toBeInTheDocument()
  vi.unstubAllGlobals()
})
