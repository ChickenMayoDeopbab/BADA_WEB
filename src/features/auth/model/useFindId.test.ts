import { act, renderHook } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { findId } from '../api/authApi'
import { useFindId } from './useFindId'

vi.mock('react-router-dom', () => ({ useNavigate: () => vi.fn() }))
vi.mock('@shared/api', () => ({
  getApiErrorMessage: (_error: unknown, fallback: string) => fallback,
}))
vi.mock('@shared/config', () => ({ routePaths: {} }))
vi.mock('../api/authApi', () => ({
  sendEmailCode: vi.fn(),
  checkEmailCode: vi.fn(),
  findId: vi.fn(),
}))

// 이메일 인증을 마친 뒤 아이디 찾기를 요청합니다.
const submitWithVerifiedEmail = async (result: { current: ReturnType<typeof useFindId> }) => {
  act(() => result.current.emailVerification.changeEmail('bada@example.com'))
  await act(() => result.current.emailVerification.sendCode())
  act(() => result.current.emailVerification.changeAuthCode('123456'))
  await act(() => result.current.submit())
}

describe('useFindId', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('조회에 성공하면 아이디를 보여준다', async () => {
    vi.mocked(findId).mockResolvedValue('bada0508')
    const { result } = renderHook(() => useFindId())

    await submitWithVerifiedEmail(result)

    expect(findId).toHaveBeenCalledWith('bada@example.com')
    expect(result.current.status).toBe('success')
    expect(result.current.foundUsername).toBe('bada0508')
  })

  it('조회에 실패하면 실패 화면을 보여주고 다시 시도할 수 있다', async () => {
    vi.mocked(findId).mockRejectedValue(new Error('not found'))
    const { result } = renderHook(() => useFindId())

    await submitWithVerifiedEmail(result)
    expect(result.current.status).toBe('fail')

    act(() => result.current.retry())
    expect(result.current.status).toBe('form')
    expect(result.current.emailVerification.authCode).toBe('')
  })
})
