import { afterEach, expect, it, vi } from 'vitest'
const { post } = vi.hoisted(() => ({ post: vi.fn() }))
vi.mock('@shared/api', () => ({ aiHttpClient: { post }, httpClient: {} }))
vi.mock('@entities/user', () => ({ getProfileImageUrl: vi.fn() }))
import { reportCommunityComment, reportCommunityPost } from './communityApi'
afterEach(() => vi.clearAllMocks())
it('게시글 ID와 사유 코드만 게시글 신고 API로 보낸다', async () => {
  post.mockResolvedValue({ data: { report_id: 1, status: 'PENDING' } })
  await reportCommunityPost(12, 'SPAM')
  expect(post).toHaveBeenCalledWith('/api/v1/community/posts/12/reports', { reason: 'SPAM' })
})
it('댓글과 답글 ID는 댓글 신고 API로 보내고 서버 오류를 호출자에게 전달한다', async () => {
  const error = new Error('already reported')
  post.mockRejectedValue(error)
  await expect(reportCommunityComment(37, 'PRIVACY')).rejects.toBe(error)
  expect(post).toHaveBeenCalledWith('/api/v1/community/comments/37/reports', { reason: 'PRIVACY' })
})
