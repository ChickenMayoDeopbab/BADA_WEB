import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { useMutation } from '@tanstack/react-query'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { ExperienceProvider } from '@shared/ui'
import { QueryProvider } from './QueryProvider'

const config = vi.hoisted(() => ({
  skeletons: true,
  pageMotion: false,
  drawerMotion: true,
  tabMotion: true,
  accordionMotion: true,
  toggleMotion: true,
  interactions: true,
  overlayMotion: false,
  skeletonMotion: true,
  spinnerMotion: true,
  toasts: true,
  toastMotion: true,
  durations: {
    page: 220,
    interaction: 180,
    overlay: 200,
    tab: 420,
    accordion: 400,
    toggle: 350,
    drawerEnter: 320,
    drawerExit: 260,
    toast: 2500,
    toastExit: 280,
  },
}))
vi.mock('@shared/config', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@shared/config')>()),
  experienceConfig: config,
}))

afterEach(() => {
  cleanup()
  config.toasts = true
})

/** 서버 완료 전후의 버튼 및 결과 피드백을 실제 MutationCache로 확인합니다. */
const SaveAction = ({ request }: { request: () => Promise<void> }) => {
  const mutation = useMutation({
    mutationFn: request,
    meta: { successMessage: '저장을 완료했어요.', errorMessage: '저장하지 못했어요.' },
  })
  return (
    <button disabled={mutation.isPending} onClick={() => mutation.mutate()}>
      저장
    </button>
  )
}

/** 개별 실패·성공 알림은 실제 애플리케이션 Provider를 거칩니다. */
const renderAction = (request: () => Promise<void>) =>
  render(
    <ExperienceProvider>
      <QueryProvider>
        <SaveAction request={request} />
      </QueryProvider>
    </ExperienceProvider>,
  )

describe('작업 결과 피드백', () => {
  it('실제 저장이 끝날 때까지 알림을 표시하지 않고 성공 후 한 번 표시한다', async () => {
    let resolve!: () => void
    renderAction(
      () =>
        new Promise<void>((done) => {
          resolve = done
        }),
    )
    fireEvent.click(screen.getByRole('button', { name: '저장' }))
    await waitFor(() => expect(screen.getByRole('button', { name: '저장' })).toBeDisabled())
    expect(screen.queryByRole('status')).not.toBeInTheDocument()
    await act(async () => resolve())
    expect(await screen.findByRole('status')).toHaveTextContent('저장을 완료했어요.')
    fireEvent.click(screen.getByRole('button', { name: '알림 닫기' }))
    await waitFor(() => expect(screen.queryByRole('status')).not.toBeInTheDocument())
  })
  it('실패를 성공으로 표시하지 않고 재시도 가능한 버튼을 유지한다', async () => {
    renderAction(() => Promise.reject(new Error('연결 오류')))
    fireEvent.click(screen.getByRole('button', { name: '저장' }))
    expect(await screen.findByRole('alert')).toHaveTextContent('저장하지 못했어요.')
    expect(screen.queryByRole('status')).not.toBeInTheDocument()
    await waitFor(() => expect(screen.getByRole('button', { name: '저장' })).toBeEnabled())
  })
  it('알림을 끈 설정에서도 저장 요청은 정상 처리한다', async () => {
    config.toasts = false
    const request = vi.fn().mockResolvedValue(undefined)
    renderAction(request)
    fireEvent.click(screen.getByRole('button', { name: '저장' }))
    await waitFor(() => expect(request).toHaveBeenCalledOnce())
    await waitFor(() => expect(screen.getByRole('button', { name: '저장' })).toBeEnabled())
    expect(screen.queryByRole('status')).not.toBeInTheDocument()
    expect(document.documentElement.dataset.uxPage).toBe('false')
    expect(document.documentElement.dataset.uxOverlay).toBe('false')
  })
})
