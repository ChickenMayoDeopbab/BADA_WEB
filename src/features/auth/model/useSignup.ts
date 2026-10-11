import { checkUsername, signup } from '../api/authApi'
import { useEmailVerification } from './useEmailVerification'
import {
  validateName,
  validatePassword,
  validatePasswordConfirm,
  validateUsername,
} from './validation'
import { getApiErrorMessage } from '@shared/api'
import { routePaths } from '@shared/config'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

export type SignupStep = 'email' | 'password' | 'profile'

// 회원가입 단계(이메일 → 비밀번호 → 이름·아이디)와 입력 상태를 관리합니다.
export const useSignup = () => {
  const navigate = useNavigate()
  const emailVerification = useEmailVerification('SIGNUP')
  const [step, setStep] = useState<SignupStep>('email')

  const [password, setPassword] = useState('')
  const [passwordConfirm, setPasswordConfirm] = useState('')
  const [passwordError, setPasswordError] = useState('')
  const [passwordConfirmError, setPasswordConfirmError] = useState('')
  const [isPasswordConfirmVisible, setIsPasswordConfirmVisible] = useState(false)

  const [name, setName] = useState('')
  const [username, setUsername] = useState('')
  const [nameError, setNameError] = useState('')
  const [usernameError, setUsernameError] = useState('')
  const [checkedUsername, setCheckedUsername] = useState<string | null>(null)
  const [isCheckingUsername, setIsCheckingUsername] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // 이메일 인증에 성공하면 비밀번호 단계로 이동합니다.
  const submitEmailStep = async () => {
    if (await emailVerification.verifyCode()) {
      setStep('password')
    }
  }

  const changePassword = (nextPassword: string) => {
    setPassword(nextPassword)
    setPasswordError('')
  }

  const changePasswordConfirm = (nextPasswordConfirm: string) => {
    setPasswordConfirm(nextPasswordConfirm)
    setPasswordConfirmError('')
  }

  // 비밀번호 규칙과 확인 값이 맞으면 이름·아이디 단계로 이동합니다.
  const submitPasswordStep = () => {
    const nextPasswordError = validatePassword(password)
    const nextPasswordConfirmError = validatePasswordConfirm(passwordConfirm, password)
    setPasswordError(nextPasswordError)
    setPasswordConfirmError(nextPasswordConfirmError)
    if (nextPasswordError || nextPasswordConfirmError) return

    setStep('profile')
  }

  const changeName = (nextName: string) => {
    setName(nextName)
    setNameError('')
  }

  // 아이디가 바뀌면 이전 중복 확인 결과를 무효화합니다.
  const changeUsername = (nextUsername: string) => {
    setUsername(nextUsername)
    setUsernameError('')
    setCheckedUsername(null)
  }

  // 입력한 아이디의 사용 가능 여부를 확인합니다.
  const confirmUsername = async () => {
    if (isCheckingUsername) return

    const validationError = validateUsername(username)
    setUsernameError(validationError)
    if (validationError) return

    const candidate = username.trim()
    setIsCheckingUsername(true)
    try {
      const isAvailable = await checkUsername(candidate)

      if (!isAvailable) {
        setCheckedUsername(null)
        setUsernameError('이미 사용 중인 아이디입니다.')
        return
      }

      setCheckedUsername(candidate)
    } catch (error) {
      setCheckedUsername(null)
      setUsernameError(
        getApiErrorMessage(error, '아이디 중복 확인에 실패했습니다. 다시 시도해주세요.'),
      )
    } finally {
      setIsCheckingUsername(false)
    }
  }

  // 모든 단계의 입력값으로 회원가입을 요청합니다.
  const submitProfileStep = async () => {
    if (isSubmitting) return

    const nextNameError = validateName(name)
    const nextUsernameError = validateUsername(username)
    setNameError(nextNameError)
    setUsernameError(nextUsernameError)
    if (nextNameError || nextUsernameError) return

    const trimmedUsername = username.trim()
    if (checkedUsername !== trimmedUsername) {
      setUsernameError('아이디 중복 확인을 해주세요.')
      return
    }

    setIsSubmitting(true)
    try {
      await signup({
        username: trimmedUsername,
        password,
        email: emailVerification.email.trim(),
        name: name.trim(),
      })
      navigate(routePaths.welcome, { replace: true })
    } catch (error) {
      setUsernameError(getApiErrorMessage(error, '회원가입에 실패했습니다. 다시 시도해주세요.'))
    } finally {
      setIsSubmitting(false)
    }
  }

  return {
    step,
    emailVerification,
    submitEmailStep,
    password,
    passwordConfirm,
    passwordError,
    passwordConfirmError,
    isPasswordConfirmVisible,
    changePassword,
    changePasswordConfirm,
    togglePasswordConfirmVisibility: () => setIsPasswordConfirmVisible((visible) => !visible),
    submitPasswordStep,
    goToEmailStep: () => setStep('email'),
    name,
    username,
    nameError,
    usernameError,
    isUsernameChecked: checkedUsername !== null && checkedUsername === username.trim(),
    isCheckingUsername,
    isSubmitting,
    changeName,
    changeUsername,
    confirmUsername,
    submitProfileStep,
    goToPasswordStep: () => setStep('password'),
  }
}

export type SignupState = ReturnType<typeof useSignup>
