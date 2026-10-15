import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { afterEach, describe, expect, it, vi } from 'vitest'
import type { CommunityPost } from '@entities/community'
import { getCommunityPost } from '../api/communityApi'
import { CommunityView } from './CommunityView'

vi.mock('../api/communityApi', async (importOriginal) => ({
  ...(await importOriginal<typeof import('../api/communityApi')>()),
  getCommunityPost: vi.fn(),
  getCommunityComments: vi.fn().mockResolvedValue([]),
}))
vi.mock('@shared/lib', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@shared/lib')>()),
  getCurrentUserId: () => 1,
}))

const dummyPost: CommunityPost = {
  id: 9,
  authorId: 1,
  author: '나',
  title: '저장된 제목',
  content: '저장된 본문',
  views: 0,
  commentCount: 0,
  createdAt: '방금 전',
  reactions: { helpful: 0, empathy: 0, like: 0 },
  myReaction: null,
  comments: [],
  attachments: [],
}
const postKey = ['community', 'post', dummyPost.id]

afterEach(() => {
  cleanup()
  vi.mocked(getCommunityPost).mockReset()
  window.history.replaceState({}, '', '/')
})

/** 캐시가 있는 실제 쿼리를 마운트하고 명시적으로 재조회를 유발합니다. */
const setup = (isEditing = false) => {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false, staleTime: Infinity } },
  })
  client.setQueryData(postKey, dummyPost)
  const path = isEditing ? '/community/:postId/edit' : '/community/:postId'
  window.history.replaceState({}, '', isEditing ? '/community/9/edit' : '/community/9')
  render(
    <QueryClientProvider client={client}>
      <MemoryRouter initialEntries={[isEditing ? '/community/9/edit' : '/community/9']}>
        <Routes>
          <Route path={path} element={<CommunityView />} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>,
  )
  return client
}

describe('게시글 캐시가 있는 상태의 재조회 오류', () => {
  it('상세 본문을 유지하고 실패 안내와 재시도를 제공하며 성공하면 최신 글을 표시한다', async () => {
    vi.mocked(getCommunityPost).mockRejectedValueOnce(new Error('offline'))
    const client = setup()
    await act(async () => {
      await client.invalidateQueries({ queryKey: postKey })
    })
    const notice = await screen.findByRole('alert', { name: '게시글 새로고침 오류' })
    expect(notice).toHaveTextContent('이전에 불러온 내용을 표시하고 있어요.')
    expect(screen.getByText('저장된 본문')).toBeInTheDocument()
    let resolve!: (post: CommunityPost) => void
    vi.mocked(getCommunityPost).mockReturnValueOnce(
      new Promise((done) => {
        resolve = done
      }),
    )
    fireEvent.click(screen.getByRole('button', { name: '다시 불러오기' }))
    await waitFor(() =>
      expect(screen.getByRole('button', { name: '다시 불러오기' })).toBeDisabled(),
    )
    expect(screen.getByText('저장된 본문')).toBeInTheDocument()
    await act(async () => resolve({ ...dummyPost, title: '최신 제목', content: '최신 본문' }))
    expect(await screen.findByText('최신 본문')).toBeInTheDocument()
    expect(screen.queryByRole('alert', { name: '게시글 새로고침 오류' })).not.toBeInTheDocument()
    expect(getCommunityPost).toHaveBeenCalledTimes(2)
  })
  it('수정 중 실패와 재시도 성공 모두에서 입력한 제목·본문을 보존한다', async () => {
    vi.mocked(getCommunityPost).mockRejectedValueOnce(new Error('offline'))
    const client = setup(true)
    const title = screen.getByRole('textbox', { name: '게시물 제목' })
    const content = screen.getByRole('textbox', { name: '게시물 본문' })
    fireEvent.change(title, { target: { value: '수정 중인 제목' } })
    fireEvent.change(content, { target: { value: '수정 중인 본문' } })
    await act(async () => {
      await client.invalidateQueries({ queryKey: postKey })
    })
    await screen.findByRole('alert', { name: '게시글 새로고침 오류' })
    expect(title).toHaveValue('수정 중인 제목')
    expect(content).toHaveValue('수정 중인 본문')
    vi.mocked(getCommunityPost).mockResolvedValueOnce({ ...dummyPost, title: '서버의 새 제목' })
    fireEvent.click(screen.getByRole('button', { name: '다시 불러오기' }))
    await waitFor(() =>
      expect(screen.queryByRole('alert', { name: '게시글 새로고침 오류' })).not.toBeInTheDocument(),
    )
    expect(title).toHaveValue('수정 중인 제목')
    expect(content).toHaveValue('수정 중인 본문')
    expect(getCommunityPost).toHaveBeenCalledTimes(2)
  })
})
