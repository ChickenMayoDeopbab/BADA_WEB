import { act, renderHook } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { changePassword } from '../api/authApi'
import { useResetPassword } from './useResetPassword'

vi.mock('react-router-dom', () => ({ useNavigate: () => vi.fn() }))
vi.mock('@shared/api', () => ({
  getApiErrorMessage: (_error: unknown, fallback: string) => fallback,
}))
vi.mock('@shared/config', () => ({ routePaths: {} }))
vi.mock('../api/authApi', () => ({
  sendEmailCode: vi.fn(),
  checkEmailCode: vi.fn(),
  changePassword: vi.fn(),
}))

describe('useResetPassword', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('이메일 인증만으로 새 비밀번호 단계로 이동하고 이메일과 비밀번호로 변경을 요청한다', async () => {
    const { result } = renderHook(() => useResetPassword())

    act(() => result.current.emailVerification.changeEmail('bada@example.com'))
    await act(() => result.current.emailVerification.sendCode())
    act(() => result.current.emailVerification.changeAuthCode('123456'))
    await act(() => result.current.submitVerifyStep())

    expect(result.current.step).toBe('password')

    act(() => result.current.changePasswordField('oldPassword', 'old12345'))
    act(() => result.current.changePasswordField('newPassword', 'abcd1234'))
    act(() => result.current.changePasswordField('newPasswordConfirm', 'abcd1234'))
    await act(() => result.current.submitPasswordStep())

    expect(changePassword).toHaveBeenCalledWith({
      email: 'bada@example.com',
      oldPassword: 'old12345',
      newPassword: 'abcd1234',
    })
    expect(result.current.step).toBe('complete')
  })
})
