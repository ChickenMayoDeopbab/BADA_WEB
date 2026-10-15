import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { afterEach, expect, it, vi } from 'vitest'
import { signout } from '../api/authApi'
import { LogoutButton } from './LogoutButton'

vi.mock('../api/authApi', () => ({ signout: vi.fn() }))
afterEach(() => {
  cleanup()
  vi.clearAllMocks()
  localStorage.clear()
})

it('두 진입점에서 중복 로그아웃을 막고 실패 후 재시도 시에만 세션을 정리한다', async () => {
  let reject!: (error: Error) => void
  vi.mocked(signout)
    .mockReturnValueOnce(
      new Promise((_resolve, fail) => {
        reject = fail
      }),
    )
    .mockResolvedValueOnce(undefined)
  const client = new QueryClient()
  localStorage.setItem('bada.accessToken', 'access-token')
  render(
    <QueryClientProvider client={client}>
      <MemoryRouter initialEntries={['/profile']}>
        <Routes>
          <Route
            path="/profile"
            element={
              <>
                <LogoutButton />
                <LogoutButton />
              </>
            }
          />
          <Route path="/" element={<h1>로그아웃 완료</h1>} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>,
  )
  fireEvent.click(screen.getAllByRole('button', { name: '로그아웃' })[0])
  await waitFor(() =>
    expect(
      screen.getAllByRole('button').every((button) => (button as HTMLButtonElement).disabled),
    ).toBe(true),
  )
  fireEvent.click(screen.getAllByRole('button')[1])
  expect(signout).toHaveBeenCalledOnce()
  await act(async () => reject(new Error('offline')))
  expect(await screen.findByRole('alert')).toHaveTextContent('로그아웃하지 못했어요.')
  expect(localStorage.getItem('bada.accessToken')).toBe('access-token')
  await waitFor(() => expect(screen.getAllByRole('button')[0]).toBeEnabled())
  fireEvent.click(screen.getAllByRole('button')[0])
  expect(await screen.findByRole('heading', { name: '로그아웃 완료' })).toBeInTheDocument()
  expect(localStorage.getItem('bada.accessToken')).toBeNull()
  expect(signout).toHaveBeenCalledTimes(2)
})
