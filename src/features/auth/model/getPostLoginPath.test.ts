import { getPostLoginPath } from './getPostLoginPath'
import { getCurrentUser } from '@entities/user'
import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('@shared/config', () => ({ routePaths: { welcome: '/welcome' } }))
vi.mock('@shared/api', () => ({ httpClient: {} }))
vi.mock('@entities/user', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@entities/user')>()),
  getCurrentUser: vi.fn(),
}))

const user = { username: 'bada', email: 'bada@example.com', name: '바다' }

describe('getPostLoginPath', () => {
  beforeEach(() => {
    vi.mocked(getCurrentUser).mockReset()
  })

  it('진단 기록이 없으면 자가진단 경로를 반환한다', async () => {
    vi.mocked(getCurrentUser).mockResolvedValue({ ...user, diagnosisDate: null, level: null })

    await expect(getPostLoginPath('/dashboard')).resolves.toBe('/welcome')
  })

  it('진단 기록이 있으면 기본 경로를 반환한다', async () => {
    vi.mocked(getCurrentUser).mockResolvedValue({
      ...user,
      diagnosisDate: '2026-10-13',
      level: 'LEVEL_2',
      levelName: '전화 마스터',
    })

    await expect(getPostLoginPath('/records')).resolves.toBe('/records')
  })

  it('프로필 조회에 실패하면 기본 경로를 반환한다', async () => {
    vi.mocked(getCurrentUser).mockRejectedValue(new Error('network'))

    await expect(getPostLoginPath('/dashboard')).resolves.toBe('/dashboard')
  })
})
