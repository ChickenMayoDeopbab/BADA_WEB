import { CommunityReportDialog } from './CommunityReportDialog'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const { post } = vi.hoisted(() => ({ post: vi.fn() }))
vi.mock('@shared/api', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@shared/api')>()),
  aiHttpClient: { post },
}))

/** 실제 신고 훅과 요청 함수를 대화상자에서 실행합니다. */
const renderReport = (type: 'post' | 'comment') => {
  const onClose = vi.fn()
  const onReported = vi.fn()
  const client = new QueryClient({ defaultOptions: { mutations: { retry: false } } })
  render(
    <QueryClientProvider client={client}>
      <CommunityReportDialog target={{ type, id: 27 }} onClose={onClose} onReported={onReported} />
    </QueryClientProvider>,
  )
  return { onClose, onReported }
}

beforeEach(() => {
  vi.clearAllMocks()
  post.mockResolvedValue({ data: {} })
  HTMLDialogElement.prototype.showModal = function () {
    this.open = true
  }
  HTMLDialogElement.prototype.close = function () {
    this.open = false
  }
})
afterEach(cleanup)

describe('게시글·댓글 신고', () => {
  it.each(['post', 'comment'] as const)(
    '%s 사유를 선택한 뒤 해당 콘텐츠 ID로 한 번 접수한다',
    async (type) => {
      let finish!: (value: unknown) => void
      post.mockImplementation(
        () =>
          new Promise((resolve) => {
            finish = resolve
          }),
      )
      const { onReported } = renderReport(type)
      expect(screen.getByRole('button', { name: '신고하기' })).toBeDisabled()
      fireEvent.click(screen.getByRole('radio', { name: '스팸 및 광고' }))
      fireEvent.click(screen.getByRole('button', { name: '신고하기' }))
      await waitFor(() => expect(screen.getByRole('button', { name: '신고 중...' })).toBeDisabled())
      fireEvent.click(screen.getByRole('button', { name: '신고 중...' }))
      expect(post).toHaveBeenCalledOnce()
      expect(post).toHaveBeenCalledWith(
        `/api/v1/community/${type === 'post' ? 'posts' : 'comments'}/27/reports`,
        { reason: 'SPAM' },
      )
      await act(async () => finish({ data: {} }))
      await waitFor(() => expect(onReported).toHaveBeenCalledOnce())
      expect(screen.queryByText('신고가 접수되었습니다.')).not.toBeInTheDocument()
      expect(screen.queryByRole('button', { name: '확인' })).not.toBeInTheDocument()
    },
  )

  it('실패하면 선택한 사유를 유지하고 재시도한다', async () => {
    post.mockRejectedValueOnce(new Error('offline'))
    const { onReported } = renderReport('comment')
    fireEvent.click(screen.getByRole('radio', { name: '개인정보 침해' }))
    fireEvent.click(screen.getByRole('button', { name: '신고하기' }))
    expect(await screen.findByRole('alert')).toHaveTextContent('신고를 접수하지 못했습니다.')
    expect(screen.getByRole('radio', { name: '개인정보 침해' })).toBeChecked()
    fireEvent.click(screen.getByRole('button', { name: '신고하기' }))
    await waitFor(() => expect(onReported).toHaveBeenCalledOnce())
  })

  it('취소 시 신고 요청을 전송하지 않는다', () => {
    const { onClose } = renderReport('post')
    fireEvent.click(screen.getByRole('button', { name: '취소' }))
    expect(onClose).toHaveBeenCalledOnce()
    expect(post).not.toHaveBeenCalled()
  })
})
