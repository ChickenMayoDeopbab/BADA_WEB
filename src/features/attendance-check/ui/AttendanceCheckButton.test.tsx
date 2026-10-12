import { AttendanceCheckButton } from './AttendanceCheckButton'
import { httpClient } from '@shared/api'
import { toDateKey } from '@shared/lib'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('@shared/api', () => ({
  httpClient: {
    get: vi.fn(),
    post: vi.fn(),
  },
}))

const renderButton = () =>
  render(
    <QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}>
      <AttendanceCheckButton />
    </QueryClientProvider>,
  )

describe('AttendanceCheckButton', () => {
  beforeEach(() => {
    vi.mocked(httpClient.get).mockReset()
    vi.mocked(httpClient.post).mockReset()
  })

  it('disables the button when today is already attended', async () => {
    vi.mocked(httpClient.get).mockResolvedValue({
      data: { data: [{ date: toDateKey(new Date()) }] },
    })

    renderButton()

    expect(await screen.findByRole('button', { name: '오늘 출석 완료' })).toBeDisabled()
  })

  it('checks attendance and refreshes the attended dates', async () => {
    vi.mocked(httpClient.get)
      .mockResolvedValueOnce({ data: { data: [] } })
      .mockResolvedValue({ data: { data: [{ date: toDateKey(new Date()) }] } })
    vi.mocked(httpClient.post).mockResolvedValue({ data: { data: true } })

    renderButton()

    const button = await screen.findByRole('button', { name: '오늘 출석하기' })
    await waitFor(() => expect(button).toBeEnabled())
    fireEvent.click(button)

    expect(await screen.findByRole('button', { name: '오늘 출석 완료' })).toBeDisabled()
    expect(httpClient.post).toHaveBeenCalledWith('/api/v1/attendance')
  })
})
