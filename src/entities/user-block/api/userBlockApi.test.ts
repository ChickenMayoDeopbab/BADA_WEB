import { describe, expect, it, vi } from 'vitest'
import { aiHttpClient, httpClient } from '@shared/api'
import { blockUser, getBlockedUsers, unblockUser } from './userBlockApi'

vi.mock('@shared/api', () => ({ aiHttpClient: { get: vi.fn(), put: vi.fn(), delete: vi.fn() }, httpClient: { post: vi.fn() } }))
describe('사용자 차단 API', () => {
  it('사용자 ID로 차단하고 해제한다', async () => {
    await blockUser(23)
    expect(aiHttpClient.put).toHaveBeenCalledWith('/api/v1/community/users/23/block')
    await unblockUser(23)
    expect(aiHttpClient.delete).toHaveBeenCalledWith('/api/v1/community/users/23/block')
  })
  it('서버 차단 목록을 반환한다', async () => {
    const users = [{ user_id: 23, name: '사용자', profile_image_url: null, blocked_at: '2026-10-14' }]
    vi.mocked(aiHttpClient.get).mockResolvedValue({ data: { blocked_users: users } })
    expect(await getBlockedUsers()).toEqual(users)
  })
  it('프로필 저장 키를 조회 URL로 변환한다', async () => {
    vi.mocked(aiHttpClient.get).mockResolvedValue({ data: { blocked_users: [{ user_id: 23, profile_image_url: 'profiles/user.png' }] } })
    vi.mocked(httpClient.post).mockResolvedValue({ data: { data: { url: 'https://example.com/profile.png' } } })
    expect((await getBlockedUsers())[0].profile_image_url).toBe('https://example.com/profile.png')
    expect(httpClient.post).toHaveBeenCalledWith('/api/v1/file', undefined, { params: { s3Key: 'profiles/user.png' } })
  })
})
