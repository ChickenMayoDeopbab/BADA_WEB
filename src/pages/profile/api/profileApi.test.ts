import { beforeEach, describe, expect, it, vi } from 'vitest'

const { getMock, patchMock, postMock, putMock } = vi.hoisted(() => ({
  getMock: vi.fn(),
  patchMock: vi.fn(),
  postMock: vi.fn(),
  putMock: vi.fn(),
}))

vi.mock('@features/auth', () => ({ getAccessToken: () => 'access-token' }))
vi.mock('@shared/api', () => ({
  httpClient: { get: getMock, patch: patchMock, post: postMock, put: putMock },
}))

import {
  getMyPage,
  getNotificationSettings,
  getRecentTrainingRecords,
  updateMyPage,
  updateNotificationSettings,
  uploadProfileImage,
} from './profileApi'

const authorization = { headers: { Authorization: 'Bearer access-token' } }

describe('profileApi', () => {
  beforeEach(() => vi.clearAllMocks())

  it('loads the profile and recent training records', async () => {
    const profile = { name: '배준하', username: 'uhihi09' }
    const records = [{ recordId: 1, scenarioName: '첫인사' }]
    getMock
      .mockResolvedValueOnce({ data: { data: profile } })
      .mockResolvedValueOnce({ data: { data: { content: records } } })

    await expect(getMyPage()).resolves.toEqual(profile)
    await expect(getRecentTrainingRecords()).resolves.toEqual(records)
    expect(getMock).toHaveBeenNthCalledWith(1, '/api/v1/user/mypage', authorization)
    expect(getMock).toHaveBeenNthCalledWith(2, '/api/v1/training-records', {
      params: { page: 0, size: 3 },
      ...authorization,
    })
  })

  it('updates profile information', async () => {
    const payload = { name: '배준하', username: 'uhihi09', s3Key: 'profiles/a.png' }
    patchMock.mockResolvedValue({ data: {} })

    await updateMyPage(payload)
    expect(patchMock).toHaveBeenCalledWith('/api/v1/user/mypage', payload, authorization)
  })

  it('loads and updates notification settings', async () => {
    const settings = { allEnabled: true, communityEnabled: false, trainingEnabled: true }
    getMock.mockResolvedValue({ data: { data: settings } })
    putMock.mockResolvedValue({ data: { data: settings } })

    await expect(getNotificationSettings()).resolves.toEqual(settings)
    await expect(updateNotificationSettings(settings)).resolves.toEqual(settings)
    expect(getMock).toHaveBeenCalledWith('/api/v1/notifications/settings', authorization)
    expect(putMock).toHaveBeenCalledWith(
      '/api/v1/notifications/settings',
      settings,
      authorization,
    )
  })

  it('uploads a profile image as multipart data', async () => {
    const file = new File(['image'], 'profile.png', { type: 'image/png' })
    postMock.mockResolvedValue({ data: { data: { s3Key: 'profiles/a.png', url: 'image-url' } } })

    await expect(uploadProfileImage(file)).resolves.toEqual({
      s3Key: 'profiles/a.png',
      url: 'image-url',
    })
    expect(postMock).toHaveBeenCalledWith(
      '/api/v1/file/upload',
      expect.any(FormData),
      expect.objectContaining({ params: { fileType: 'PROFILE' } }),
    )
  })
})
