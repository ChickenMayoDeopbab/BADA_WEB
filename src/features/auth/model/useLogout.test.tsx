import { useLogout } from './useLogout'
import { getAccessToken, setAuthTokens, clearAuthSession } from './authSession'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { afterEach, expect, it, vi } from 'vitest'

const { remove } = vi.hoisted(() => ({ remove: vi.fn() }))
vi.mock('@shared/api', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@shared/api')>()),
  httpClient: { delete: remove },
}))

/** 로그아웃 요청 상태와 오류를 테스트 화면에 표시합니다. */
const LogoutControl = () => {
  const { handleLogout, isLoggingOut, logoutError } = useLogout()
  return (
    <>
      <button disabled={isLoggingOut} onClick={handleLogout}>
        로그아웃
      </button>
      {logoutError && <p role="alert">{logoutError}</p>}
    </>
  )
}

/** 로그아웃 완료 전후의 라우트와 캐시를 확인합니다. */
const renderLogout = () => {
  setAuthTokens({ accessToken: 'current-token', refreshToken: 'refresh-token' }, true)
  const client = new QueryClient({ defaultOptions: { mutations: { retry: false } } })
  client.setQueryData(['private-profile'], { name: '사용자' })
  render(
    <QueryClientProvider client={client}>
      <MemoryRouter initialEntries={['/account']}>
        <Routes>
          <Route path="/account" element={<LogoutControl />} />
          <Route path="/" element={<h1>시작 화면</h1>} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>,
  )
  return client
}

afterEach(() => {
  cleanup()
  clearAuthSession()
  vi.clearAllMocks()
})

it('서버 종료를 기다린 뒤 토큰과 사용자 캐시를 지우고 이동한다', async () => {
  let finish!: () => void
  remove.mockImplementation(
    () =>
      new Promise<void>((resolve) => {
        finish = resolve
      }),
  )
  const client = renderLogout()
  fireEvent.click(screen.getByRole('button', { name: '로그아웃' }))
  await waitFor(() => expect(screen.getByRole('button')).toBeDisabled())
  expect(remove).toHaveBeenCalledWith('/api/v1/auth/signout')
  expect(getAccessToken()).toBe('current-token')
  expect(client.getQueryData(['private-profile'])).toBeDefined()
  finish()
  expect(await screen.findByRole('heading', { name: '시작 화면' })).toBeInTheDocument()
  expect(getAccessToken()).toBeNull()
  expect(client.getQueryCache().getAll()).toHaveLength(0)
})

it('서버 종료 실패 시 세션과 화면을 유지하고 재시도할 수 있다', async () => {
  remove.mockRejectedValueOnce(new Error('network')).mockResolvedValueOnce(undefined)
  const client = renderLogout()
  fireEvent.click(screen.getByRole('button', { name: '로그아웃' }))
  expect(await screen.findByRole('alert')).toHaveTextContent('로그아웃하지 못했습니다')
  expect(getAccessToken()).toBe('current-token')
  expect(client.getQueryData(['private-profile'])).toBeDefined()
  fireEvent.click(screen.getByRole('button', { name: '로그아웃' }))
  expect(await screen.findByRole('heading', { name: '시작 화면' })).toBeInTheDocument()
})
