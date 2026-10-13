import { refreshAuthTokens } from '../api/authApi'
import { getValidAccessToken } from './getValidAccessToken'
import { clearAuthSession, getAccessToken, setAuthTokens } from './authSession'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('../api/authApi', () => ({ refreshAuthTokens: vi.fn() }))
const refresh = vi.mocked(refreshAuthTokens)

/** 만료·subject 검증에 사용할 테스트 토큰을 생성합니다. */
const token = (payload: Record<string, unknown>) =>
  `header.${window.btoa(JSON.stringify(payload))}.signature`

describe('voice and HTTP shared access token', () => {
  beforeEach(() => {
    clearAuthSession()
    refresh.mockReset()
  })
  afterEach(clearAuthSession)

  it('refreshes an expired access token once for concurrent voice and HTTP users', async () => {
    setAuthTokens({ accessToken: token({ exp: 1 }), refreshToken: token({ sub: '12' }) }, false)
    refresh.mockResolvedValue({ accessToken: 'new-access', refreshToken: 'new-refresh' })
    expect(await Promise.all([getValidAccessToken(), getValidAccessToken()])).toEqual([
      'new-access',
      'new-access',
    ])
    expect(refresh).toHaveBeenCalledOnce()
    expect(window.sessionStorage.getItem('bada.accessToken')).toBe('new-access')
  })

  it('does not restore an old session when a delayed refresh finishes after logout', async () => {
    setAuthTokens({ accessToken: token({ exp: 1 }), refreshToken: token({ sub: '12' }) }, true)
    let resolve!: (tokens: { accessToken: string; refreshToken: string }) => void
    refresh.mockReturnValue(
      new Promise((done) => {
        resolve = done
      }),
    )
    const pending = getValidAccessToken()
    clearAuthSession()
    resolve({ accessToken: 'old-session', refreshToken: 'old-refresh' })
    await expect(pending).rejects.toThrow('AUTH_REQUIRED')
    expect(getAccessToken()).toBeNull()
  })
})
