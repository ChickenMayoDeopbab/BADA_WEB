import { clearAuthSession, setAccessToken, setAuthTokens } from '../model/authSession'
import { RequireAuth } from './RequireAuth'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { act, cleanup, render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { afterEach, describe, expect, it, vi } from 'vitest'

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
      <MemoryRouter initialEntries={['/dashboard']}>
        <Routes>
          <Route element={<RequireAuth />}>
            <Route path="/dashboard" element={<h1>대시보드</h1>} />
          </Route>
          <Route path="/" element={<h1>랜딩 페이지</h1>} />
          <Route path="/login" element={<h1>로그인</h1>} />
        </Routes>
      </MemoryRouter>
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

  it('세션이 있으면 보호 화면을 표시하고 토큰 제거 즉시 랜딩으로 보낸다', () => {
    setAccessToken('test-access-token')
    renderProtectedRoute()
    expect(screen.getByRole('heading', { name: '대시보드' })).toBeInTheDocument()
    act(() => clearAuthSession())
    expect(screen.getByRole('heading', { name: '랜딩 페이지' })).toBeInTheDocument()
  })

  it('다른 탭의 로그아웃 저장소 이벤트도 즉시 반영한다', () => {
    setAccessToken('test-access-token')
    const client = renderProtectedRoute()
    act(() => {
      localStorage.removeItem('bada.accessToken')
      window.dispatchEvent(new StorageEvent('storage', { key: 'bada.accessToken', newValue: null }))
    })
    expect(client.getQueryData(['private-profile'])).toBeUndefined()
    expect(screen.getByRole('heading', { name: '랜딩 페이지' })).toBeInTheDocument()
  })

  it('화면을 이동하지 않아도 마지막 유효 토큰이 만료되면 랜딩으로 보낸다', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-10-15T01:00:00Z'))
    const token = (seconds: number) =>
      `header.${btoa(JSON.stringify({ sub: '34', exp: Date.now() / 1000 + seconds }))}.signature`
    setAuthTokens({ accessToken: token(1), refreshToken: token(2) }, true)
    renderProtectedRoute()
    act(() => {
      vi.advanceTimersByTime(1000)
    })
    expect(screen.getByRole('heading', { name: '대시보드' })).toBeInTheDocument()
    act(() => {
      vi.advanceTimersByTime(1000)
    })
    expect(screen.getByRole('heading', { name: '랜딩 페이지' })).toBeInTheDocument()
  })

  it('토큰 교체 중에는 보호 화면을 이탈하지 않는다', () => {
    setAuthTokens({ accessToken: 'old-access', refreshToken: 'old-refresh' }, true)
    renderProtectedRoute()
    act(() => setAuthTokens({ accessToken: 'new-access', refreshToken: 'new-refresh' }, false))
    expect(screen.getByRole('heading', { name: '대시보드' })).toBeInTheDocument()
  })
})
