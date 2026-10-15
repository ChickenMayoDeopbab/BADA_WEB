import { renderHook, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { exchangeOAuthCode, getOAuthLoginUrl } from '../api/authApi'
import { getAccessToken } from './authSession'
import { getPostLoginPath } from './getPostLoginPath'
import { startOAuthLogin, useOAuthCallback } from './useOAuthLogin'

const navigate = vi.fn()
let searchParams = new URLSearchParams()

vi.mock('react-router-dom', () => ({
  useNavigate: () => navigate,
  useSearchParams: () => [searchParams],
}))
vi.mock('@shared/api', () => ({
  getApiErrorMessage: (_error: unknown, fallback: string) => fallback,
}))
vi.mock('@shared/config', () => ({
  authStorageKeys: {
    accessToken: 'bada.accessToken',
    refreshToken: 'bada.refreshToken',
  },
  routePaths: {
    login: '/login',
    welcome: '/welcome',
    dashboard: '/dashboard',
    oauthCallback: '/oauth/callback',
  },
}))
vi.mock('../api/authApi', () => ({
  exchangeOAuthCode: vi.fn(),
  getOAuthLoginUrl: vi.fn(),
}))
vi.mock('./getPostLoginPath', () => ({
  getPostLoginPath: vi.fn((fallbackPath: string) => Promise.resolve(fallbackPath)),
}))

describe('startOAuthLogin', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
    vi.clearAllMocks()
  })

  it.each(['google', 'naver', 'apple'] as const)(
    '%s 로그인은 서버 기본 앱 링크 대신 chickenmayo.kr 콜백을 지정한다',
    (provider) => {
      const assign = vi.fn()
      vi.stubGlobal('window', { location: { assign } })
      const loginUrl = `https://api.example.test/api/v1/auth/${provider}`
      vi.mocked(getOAuthLoginUrl).mockReturnValueOnce(loginUrl)

      startOAuthLogin(provider)

      expect(getOAuthLoginUrl).toHaveBeenCalledWith(
        provider,
        'https://chickenmayo.kr/oauth/callback',
      )
      expect(assign).toHaveBeenCalledWith(loginUrl)
    },
  )
})

describe('useOAuthCallback', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    window.localStorage.clear()
  })

  it('code를 교환해 토큰을 저장하고 대시보드로 이동한다', async () => {
    searchParams = new URLSearchParams('code=oauth-code')
    vi.mocked(exchangeOAuthCode).mockResolvedValue({
      accessToken: 'access',
      refreshToken: 'refresh',
      isNewUser: false,
    })

    renderHook(() => useOAuthCallback())

    await waitFor(() => expect(navigate).toHaveBeenCalledWith('/dashboard', { replace: true }))
    expect(exchangeOAuthCode).toHaveBeenCalledTimes(1)
    expect(getAccessToken()).toBe('access')
  })

  it('새로 가입한 사용자는 환영 화면으로 이동한다', async () => {
    searchParams = new URLSearchParams('code=oauth-code')
    vi.mocked(exchangeOAuthCode).mockResolvedValue({
      accessToken: 'access',
      refreshToken: 'refresh',
      isNewUser: true,
    })

    renderHook(() => useOAuthCallback())

    await waitFor(() => expect(navigate).toHaveBeenCalledWith('/welcome', { replace: true }))
    expect(getPostLoginPath).not.toHaveBeenCalled()
  })

  it('진단 기록이 없는 기존 사용자는 자가진단으로 이동한다', async () => {
    searchParams = new URLSearchParams('code=oauth-code')
    vi.mocked(exchangeOAuthCode).mockResolvedValue({
      accessToken: 'access',
      refreshToken: 'refresh',
      isNewUser: false,
    })
    vi.mocked(getPostLoginPath).mockResolvedValueOnce('/welcome')

    renderHook(() => useOAuthCallback())

    await waitFor(() => expect(navigate).toHaveBeenCalledWith('/welcome', { replace: true }))
    expect(getPostLoginPath).toHaveBeenCalledWith('/dashboard')
  })

  it('제공자가 오류를 돌려주면 교환하지 않고 오류를 보여준다', () => {
    searchParams = new URLSearchParams('error=access_denied&error_description=취소되었습니다.')

    const { result } = renderHook(() => useOAuthCallback())

    expect(exchangeOAuthCode).not.toHaveBeenCalled()
    expect(result.current.status).toBe('error')
    expect(result.current.errorMessage).toBe('취소되었습니다.')
  })
})
