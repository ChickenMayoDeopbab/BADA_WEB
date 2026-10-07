import { describe, expect, it, vi } from 'vitest'
import { aiHttpClient } from '@shared/api'
import { blockUser, getBlockedUsers, unblockUser } from './userBlockApi'

vi.mock('@shared/api', () => ({ aiHttpClient: { get: vi.fn(), put: vi.fn(), delete: vi.fn() } }))
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
})
