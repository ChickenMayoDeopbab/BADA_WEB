import { act, renderHook } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { checkEmailCode, checkUsername, sendEmailCode, signup, login } from '../api/authApi'
import { useSignup } from './useSignup'

const navigate = vi.fn()

vi.mock('react-router-dom', () => ({ useNavigate: () => navigate }))
vi.mock('@shared/api', () => ({
  getApiErrorMessage: (_error: unknown, fallback: string) => fallback,
}))
vi.mock('./authSession', () => ({ setAuthTokens: vi.fn() }))
vi.mock('../api/authApi', () => ({
  sendEmailCode: vi.fn(),
  checkEmailCode: vi.fn(),
  checkUsername: vi.fn(),
  signup: vi.fn(),
  login: vi.fn(),
}))

// 이메일·비밀번호 단계를 통과해 이름·아이디 단계까지 이동합니다.
const moveToProfileStep = async (result: { current: ReturnType<typeof useSignup> }) => {
  act(() => result.current.emailVerification.changeEmail('bada@example.com'))
  await act(() => result.current.emailVerification.sendCode())
  act(() => result.current.emailVerification.changeAuthCode('123456'))
  await act(() => result.current.submitEmailStep())
  act(() => result.current.changePassword('abcd1234'))
  act(() => result.current.changePasswordConfirm('abcd1234'))
  act(() => result.current.submitPasswordStep())
}

describe('useSignup', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(login).mockResolvedValue({ accessToken: 'access', refreshToken: 'refresh' })
  })

  it('인증코드를 전송하지 않으면 다음 단계로 넘어가지 않는다', async () => {
    const { result } = renderHook(() => useSignup())

    act(() => result.current.emailVerification.changeEmail('bada@example.com'))
    act(() => result.current.emailVerification.changeAuthCode('123456'))
    await act(() => result.current.submitEmailStep())

    expect(checkEmailCode).not.toHaveBeenCalled()
    expect(result.current.emailVerification.emailError).toBe('먼저 인증코드를 전송해주세요.')
    expect(result.current.step).toBe('email')
  })

  it('이메일 인증과 비밀번호 확인을 마치면 이름·아이디 단계로 이동한다', async () => {
    const { result } = renderHook(() => useSignup())

    await moveToProfileStep(result)

    expect(sendEmailCode).toHaveBeenCalledWith({ email: 'bada@example.com', type: 'SIGNUP' })
    expect(checkEmailCode).toHaveBeenCalledWith({
      email: 'bada@example.com',
      authNum: '123456',
      type: 'SIGNUP',
    })
    expect(result.current.step).toBe('profile')
  })

  it('중복 확인을 하지 않으면 회원가입을 요청하지 않는다', async () => {
    const { result } = renderHook(() => useSignup())
    await moveToProfileStep(result)

    act(() => result.current.changeName('김바다'))
    act(() => result.current.changeUsername('bada'))
    await act(() => result.current.submitProfileStep())

    expect(signup).not.toHaveBeenCalled()
    expect(result.current.usernameError).toBe('아이디 중복 확인을 해주세요.')
  })

  it('이미 사용 중인 아이디면 오류를 표시한다', async () => {
    vi.mocked(checkUsername).mockResolvedValue(false)
    const { result } = renderHook(() => useSignup())
    await moveToProfileStep(result)

    act(() => result.current.changeUsername('bada'))
    await act(() => result.current.confirmUsername())

    expect(result.current.isUsernameChecked).toBe(false)
    expect(result.current.usernameError).toBe('이미 사용 중인 아이디입니다.')
  })

  it('회원가입 후 자동 로그인이 실패해도 가입을 반복하지 않고 로그인 화면으로 이동한다', async () => {
    vi.mocked(checkUsername).mockResolvedValue(true)
    vi.mocked(login).mockRejectedValueOnce(new Error('login unavailable'))
    const { result } = renderHook(() => useSignup())
    await moveToProfileStep(result)
    act(() => result.current.changeName('김바다'))
    act(() => result.current.changeUsername('bada'))
    await act(() => result.current.confirmUsername())
    await act(() => result.current.submitProfileStep())
    expect(signup).toHaveBeenCalledTimes(1)
    expect(navigate).toHaveBeenCalledWith('/login', {
      replace: true,
      state: { signupComplete: true, username: 'bada' },
    })
  })

  it('사용 가능한 아이디로 회원가입하고 환영 화면으로 이동한다', async () => {
    vi.mocked(checkUsername).mockResolvedValue(true)
    const { result } = renderHook(() => useSignup())
    await moveToProfileStep(result)

    act(() => result.current.changeName('김바다'))
    act(() => result.current.changeUsername('bada'))
    await act(() => result.current.confirmUsername())
    await act(() => result.current.submitProfileStep())

    expect(signup).toHaveBeenCalledWith({
      username: 'bada',
      password: 'abcd1234',
      email: 'bada@example.com',
      name: '김바다',
    })
    expect(navigate).toHaveBeenCalledWith('/welcome', { replace: true })
  })
})
