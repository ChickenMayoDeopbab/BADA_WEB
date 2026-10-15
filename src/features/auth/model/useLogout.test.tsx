import { fireEvent, render, screen, waitFor, cleanup } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { afterEach, expect, it, vi } from 'vitest'
import { useLogout } from './useLogout'
import { signout } from '../api/authApi'

vi.mock('../api/authApi', () => ({ signout: vi.fn() }))

/** 실제 훅의 진행·실패 상태를 표시하는 테스트 화면입니다. */
const LogoutHarness = () => {
  const logout = useLogout()
  return (
    <>
      <button disabled={logout.isPending} onClick={() => logout.mutate()}>
        로그아웃
      </button>
      {logout.isError && <p role="alert">failed</p>}
    </>
  )
}

/** 서버 성공 후에만 랜딩 화면으로 이동하는 실제 훅을 마운트합니다. */
const setup = () => {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  })
  client.setQueryData(['user', 'current'], { name: '이전 사용자' })
  localStorage.setItem('bada.accessToken', 'access-token')
  localStorage.setItem('bada.refreshToken', 'refresh-token')
  sessionStorage.setItem('bada.accessToken', 'session-access')
  sessionStorage.setItem('bada.refreshToken', 'session-refresh')
  render(
    <QueryClientProvider client={client}>
      <MemoryRouter initialEntries={['/profile']}>
        <Routes>
          <Route path="/profile" element={<LogoutHarness />} />
          <Route path="/" element={<h1>랜딩 화면</h1>} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>,
  )
  return client
}

afterEach(() => {
  cleanup()
  localStorage.clear()
  sessionStorage.clear()
  vi.clearAllMocks()
})

it('서버 성공 응답 후 조회를 취소하고 양쪽 저장소와 사용자 캐시를 삭제한다', async () => {
  let resolve!: () => void
  vi.mocked(signout).mockReturnValue(
    new Promise<void>((done) => {
      resolve = done
    }),
  )
  const client = setup()
  let aborted = false
  void client
    .fetchQuery({
      queryKey: ['private', 'pending'],
      queryFn: ({ signal }) =>
        new Promise((_resolve, reject) => {
          signal.addEventListener('abort', () => {
            aborted = true
            reject(new Error('aborted'))
          })
        }),
    })
    .catch(() => undefined)
  fireEvent.click(screen.getByRole('button'))
  await waitFor(() => expect(screen.getByRole('button')).toBeDisabled())
  expect(localStorage.getItem('bada.accessToken')).toBe('access-token')
  expect(client.getQueryData(['user', 'current'])).toEqual({ name: '이전 사용자' })
  resolve()
  await screen.findByRole('heading', { name: '랜딩 화면' })
  expect(aborted).toBe(true)
  expect(client.getQueryCache().getAll()).toHaveLength(0)
  for (const storage of [localStorage, sessionStorage]) {
    expect(storage.getItem('bada.accessToken')).toBeNull()
    expect(storage.getItem('bada.refreshToken')).toBeNull()
  }
})

it('서버 실패 시 세션과 캐시를 보존하고 명시적으로 재시도할 수 있다', async () => {
  vi.mocked(signout)
    .mockRejectedValueOnce(new Error('server unavailable'))
    .mockResolvedValueOnce(undefined)
  const client = setup()
  fireEvent.click(screen.getByRole('button'))
  await screen.findByRole('alert')
  expect(localStorage.getItem('bada.accessToken')).toBe('access-token')
  expect(client.getQueryData(['user', 'current'])).toEqual({ name: '이전 사용자' })
  expect(signout).toHaveBeenCalledTimes(1)
  fireEvent.click(screen.getByRole('button'))
  await waitFor(() =>
    expect(screen.getByRole('heading', { name: '랜딩 화면' })).toBeInTheDocument(),
  )
  expect(signout).toHaveBeenCalledTimes(2)
})
