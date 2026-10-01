import { clearAuthSession, setAccessToken } from '../model/authSession'
import { RequireAuth } from './RequireAuth'
import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { afterEach, describe, expect, it, vi } from 'vitest'

vi.mock('@shared/config', () => ({
  env: { isAuthGuardEnabled: true },
  routePaths: { login: '/login' },
}))

describe('RequireAuth', () => {
  afterEach(() => {
    clearAuthSession()
  })

  it('redirects a guest to the login page', () => {
    render(
      <MemoryRouter initialEntries={['/dashboard']}>
        <Routes>
          <Route element={<RequireAuth />}>
            <Route path="/dashboard" element={<h1>대시보드</h1>} />
          </Route>
          <Route path="/login" element={<h1>로그인</h1>} />
        </Routes>
      </MemoryRouter>,
    )

    expect(screen.getByRole('heading', { name: '로그인' })).toBeInTheDocument()
  })

  it('renders a protected route when a session exists', () => {
    setAccessToken('test-access-token')

    render(
      <MemoryRouter initialEntries={['/dashboard']}>
        <Routes>
          <Route element={<RequireAuth />}>
            <Route path="/dashboard" element={<h1>대시보드</h1>} />
          </Route>
          <Route path="/login" element={<h1>로그인</h1>} />
        </Routes>
      </MemoryRouter>,
    )

    expect(screen.getByRole('heading', { name: '대시보드' })).toBeInTheDocument()
  })
})
