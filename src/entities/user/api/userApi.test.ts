import { getCurrentUser, getProfileImageUrl } from './userApi'
import { httpClient } from '@shared/api'
import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('@shared/api', () => ({
  httpClient: {
    get: vi.fn(),
    post: vi.fn(),
  },
}))

describe('userApi', () => {
  beforeEach(() => {
    vi.mocked(httpClient.get).mockReset()
    vi.mocked(httpClient.post).mockReset()
  })

  it('returns the current user from the API response', async () => {
    const user = {
      username: 'bada-user',
      email: 'user@example.com',
      name: '바다',
      s3Key: 'profiles/user.png',
    }
    vi.mocked(httpClient.get).mockResolvedValue({ data: { data: user } })

    await expect(getCurrentUser()).resolves.toEqual(user)
    expect(httpClient.get).toHaveBeenCalledWith('/api/v1/user/mypage')
  })

  it('returns a profile image URL for an S3 key', async () => {
    vi.mocked(httpClient.post).mockResolvedValue({
      data: { data: { url: 'https://example.com/profile.png' } },
    })

    await expect(getProfileImageUrl('profiles/user.png')).resolves.toBe(
      'https://example.com/profile.png',
    )
    expect(httpClient.post).toHaveBeenCalledWith('/api/v1/file', undefined, {
      params: { s3Key: 'profiles/user.png' },
    })
  })
})
