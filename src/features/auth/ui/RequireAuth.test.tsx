import {
  clearAuthSession,
  setAccessToken,
  setAuthTokens,
  replaceAuthTokens,
} from '../model/authSession'
import { RequireAuth } from './RequireAuth'
import { AuthProvider } from './AuthProvider'
import { getCurrentUser } from '@entities/user'
import { refreshAuthTokens } from '../api/authApi'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { act, cleanup, render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('@entities/user', () => ({ getCurrentUser: vi.fn() }))
vi.mock('../api/authApi', () => ({ refreshAuthTokens: vi.fn() }))
const user = { username: 'bada', name: '바다', email: 'bada@example.test' }
beforeEach(() => {
  vi.mocked(getCurrentUser).mockReset().mockResolvedValue(user)
  vi.mocked(refreshAuthTokens).mockReset()
})

vi.mock('@shared/config', () => ({
  authStorageKeys: { accessToken: 'bada.accessToken', refreshToken: 'bada.refreshToken' },
  env: { isAuthGuardEnabled: false },
  routePaths: { landing: '/', login: '/login' },
}))

/** 실제 인증 구독으로 보호된 화면과 랜딩 이동을 확인합니다. */
const renderProtectedRoute = () => {
  const queryClient = new QueryClient()
  queryClient.setQueryData(['private-profile'], { name: '이전 사용자' })
  render(
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <MemoryRouter initialEntries={['/dashboard']}>
          <Routes>
            <Route element={<RequireAuth />}>
              <Route path="/dashboard" element={<h1>대시보드</h1>} />
            </Route>
            <Route path="/" element={<h1>랜딩 페이지</h1>} />
            <Route path="/login" element={<h1>로그인</h1>} />
          </Routes>
        </MemoryRouter>
      </AuthProvider>
    </QueryClientProvider>,
  )
  return queryClient
}

afterEach(() => {
  cleanup()
  clearAuthSession()
  vi.useRealTimers()
})

describe('RequireAuth', () => {
  it('우회 환경변수가 남아 있어도 토큰이 없는 사용자는 랜딩으로 보낸다', () => {
    renderProtectedRoute()
    expect(screen.getByRole('heading', { name: '랜딩 페이지' })).toBeInTheDocument()
    expect(screen.queryByRole('heading', { name: '대시보드' })).not.toBeInTheDocument()
  })

  it('서버가 확인한 세션만 표시하고 토큰 제거 즉시 랜딩으로 보낸다', async () => {
    setAccessToken('test-access-token')
    renderProtectedRoute()
    expect(await screen.findByRole('heading', { name: '대시보드' })).toBeInTheDocument()
    act(() => clearAuthSession())
    expect(screen.getByRole('heading', { name: '랜딩 페이지' })).toBeInTheDocument()
  })

  it('다른 탭의 로그아웃 저장소 이벤트도 즉시 반영한다', async () => {
    setAccessToken('test-access-token')
    const client = renderProtectedRoute()
    await screen.findByRole('heading', { name: '대시보드' })
    client.setQueryData(['private-profile'], { name: '이전 사용자' })
    act(() => {
      localStorage.removeItem('bada.accessToken')
      window.dispatchEvent(new StorageEvent('storage', { key: 'bada.accessToken', newValue: null }))
    })
    expect(client.getQueryData(['private-profile'])).toBeUndefined()
    expect(screen.getByRole('heading', { name: '랜딩 페이지' })).toBeInTheDocument()
  })

  it('화면을 이동하지 않아도 마지막 유효 토큰이 만료되면 랜딩으로 보낸다', async () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-10-15T01:00:00Z'))
    const token = (seconds: number) =>
      `header.${btoa(JSON.stringify({ sub: '34', exp: Date.now() / 1000 + seconds }))}.signature`
    setAuthTokens({ accessToken: token(1), refreshToken: token(2) }, true)
    renderProtectedRoute()
    await act(async () => {})
    act(() => {
      vi.advanceTimersByTime(1000)
    })
    expect(screen.getByRole('heading', { name: '대시보드' })).toBeInTheDocument()
    act(() => {
      vi.advanceTimersByTime(1000)
    })
    expect(screen.getByRole('heading', { name: '랜딩 페이지' })).toBeInTheDocument()
  })

  it('토큰 교체 중에는 새 세션의 서버 확인이 끝날 때까지 보호 화면을 숨긴다', async () => {
    setAuthTokens({ accessToken: 'old-access', refreshToken: 'old-refresh' }, true)
    renderProtectedRoute()
    await screen.findByRole('heading', { name: '대시보드' })
    act(() => setAuthTokens({ accessToken: 'new-access', refreshToken: 'new-refresh' }, false))
    expect(screen.queryByRole('heading', { name: '대시보드' })).not.toBeInTheDocument()
    expect(await screen.findByRole('heading', { name: '대시보드' })).toBeInTheDocument()
  })

  it('토큰이 저장돼 있어도 서버 확인이 끝나기 전에는 보호 화면을 렌더링하지 않는다', async () => {
    let finish!: (value: typeof user) => void
    vi.mocked(getCurrentUser).mockImplementation(
      () =>
        new Promise((resolve) => {
          finish = resolve
        }),
    )
    setAccessToken('unverified-token')
    renderProtectedRoute()
    expect(screen.queryByRole('heading', { name: '대시보드' })).not.toBeInTheDocument()
    await act(async () => {})
    await act(async () => finish(user))
    expect(await screen.findByRole('heading', { name: '대시보드' })).toBeInTheDocument()
  })

  it('같은 사용자의 토큰 갱신은 화면을 유지하고 사용자 확인을 중복 요청하지 않는다', async () => {
    setAuthTokens({ accessToken: 'old-access', refreshToken: 'old-refresh' }, true)
    renderProtectedRoute()
    await screen.findByRole('heading', { name: '대시보드' })
    expect(getCurrentUser).toHaveBeenCalledOnce()
    act(() => replaceAuthTokens({ accessToken: 'new-access', refreshToken: 'new-refresh' }))
    expect(screen.getByRole('heading', { name: '대시보드' })).toBeInTheDocument()
    await act(async () => {})
    expect(getCurrentUser).toHaveBeenCalledOnce()
    expect(screen.getByRole('heading', { name: '대시보드' })).toBeInTheDocument()
  })

  it('초기 인증 도중 만료 토큰을 갱신해도 사용자 확인을 한 번 마친 뒤 화면을 연다', async () => {
    const token = (expiration: number) =>
      `header.${btoa(JSON.stringify({ sub: '34', exp: expiration }))}.signature`
    setAuthTokens({ accessToken: token(1), refreshToken: token(Date.now() / 1000 + 60) }, true)
    vi.mocked(refreshAuthTokens).mockResolvedValue({
      accessToken: 'renewed-access',
      refreshToken: 'renewed-refresh',
    })
    renderProtectedRoute()
    expect(screen.queryByRole('heading', { name: '대시보드' })).not.toBeInTheDocument()
    expect(await screen.findByRole('heading', { name: '대시보드' })).toBeInTheDocument()
    expect(refreshAuthTokens).toHaveBeenCalledOnce()
    expect(getCurrentUser).toHaveBeenCalledOnce()
  })

  it('서버 인증 실패는 오류 문구를 노출하지 않고 세션을 지운 뒤 랜딩으로 보낸다', async () => {
    vi.mocked(getCurrentUser).mockRejectedValue(new Error('인증이 필요합니다.'))
    setAccessToken('rejected-token')
    const client = renderProtectedRoute()
    expect(await screen.findByRole('heading', { name: '랜딩 페이지' })).toBeInTheDocument()
    expect(screen.queryByText('인증이 필요합니다.')).not.toBeInTheDocument()
    expect(client.getQueryData(['private-profile'])).toBeUndefined()
  })
})
