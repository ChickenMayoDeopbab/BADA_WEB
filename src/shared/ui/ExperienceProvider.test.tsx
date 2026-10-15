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

it('신고 완료는 공통 토스트에서도 3초 뒤 사라지고 중복 메시지는 한 개만 표시한다', () => {
  vi.useFakeTimers()
  renderToast({ message: '신고가 접수되었습니다.', position: 'top-right', duration: 3000 })
  fireEvent.click(screen.getByRole('button', { name: '완료 알림' }))
  fireEvent.click(screen.getByRole('button', { name: '완료 알림' }))
  expect(screen.getAllByRole('status')).toHaveLength(1)
  act(() => {
    vi.advanceTimersByTime(2999)
  })
  expect(screen.getByRole('status')).toHaveTextContent('신고가 접수되었습니다.')
  act(() => {
    vi.advanceTimersByTime(1)
  })
  expect(screen.queryByRole('status')).not.toBeInTheDocument()
})

it('옵션이 없는 기존 토스트는 공통 유지 시간을 사용한다', () => {
  vi.useFakeTimers()
  renderToast({ message: '저장했어요.' })
  fireEvent.click(screen.getByRole('button', { name: '완료 알림' }))
  act(() => {
    vi.advanceTimersByTime(3000)
  })
  expect(screen.getByRole('status')).toHaveTextContent('저장했어요.')
  act(() => {
    vi.advanceTimersByTime(1500)
  })
  expect(screen.queryByRole('status')).not.toBeInTheDocument()
})

it('전역 토스트를 끄면 위치·유지 시간 옵션이 있어도 표시하지 않는다', () => {
  flags.toasts = false
  renderToast({ message: '신고가 접수되었습니다.', position: 'top-right', duration: 3000 })
  fireEvent.click(screen.getByRole('button', { name: '완료 알림' }))
  expect(screen.queryByRole('status')).not.toBeInTheDocument()
})

it('위에 마우스를 올린 알림은 유지하고 닫기 버튼과 화면 해제로 정리한다', () => {
  vi.useFakeTimers()
  const view = renderToast({
    message: '신고가 접수되었습니다.',
    position: 'top-right',
    duration: 3000,
  })
  fireEvent.click(screen.getByRole('button', { name: '완료 알림' }))
  fireEvent.mouseEnter(screen.getByRole('status').parentElement!)
  act(() => {
    vi.advanceTimersByTime(5000)
  })
  expect(screen.getByRole('status')).toBeInTheDocument()
  fireEvent.click(screen.getByRole('button', { name: '알림 닫기' }))
  expect(screen.queryByRole('status')).not.toBeInTheDocument()
  fireEvent.click(screen.getByRole('button', { name: '완료 알림' }))
  view.unmount()
  expect(vi.getTimerCount()).toBe(0)
})
