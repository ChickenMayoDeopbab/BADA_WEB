import { login } from '../api/authApi'
import { setAuthTokens } from './authSession'
import { getPostLoginPath } from './getPostLoginPath'
import { validateLoginPassword, validateLoginUsername } from './validation'
import { getApiErrorMessage } from '@shared/api'
import { routePaths } from '@shared/config'
import { useState, type FormEvent } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'

type LoginLocationState = {
  from?: string
}

// 아이디 로그인 폼의 입력, 검증, 제출 상태를 관리합니다.
export const useIdLogin = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [usernameError, setUsernameError] = useState('')
  const [passwordError, setPasswordError] = useState('')
  const [isPasswordVisible, setIsPasswordVisible] = useState(false)
  const [keepSignedIn, setKeepSignedIn] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const changeUsername = (nextUsername: string) => {
    setUsername(nextUsername)
    setUsernameError('')
  }

  const changePassword = (nextPassword: string) => {
    setPassword(nextPassword)
    setPasswordError('')
  }

  // 로그인에 성공하면 토큰을 저장하고, 진단 기록이 없으면 자가진단으로, 아니면 원래 가려던 화면으로 이동합니다.
  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (isSubmitting) return

    const nextUsernameError = validateLoginUsername(username)
    const nextPasswordError = validateLoginPassword(password)
    setUsernameError(nextUsernameError)
    setPasswordError(nextPasswordError)
    if (nextUsernameError || nextPasswordError) return

    setIsSubmitting(true)
    try {
      const tokens = await login({ username: username.trim(), password })
      setAuthTokens(tokens, keepSignedIn)

      const from = (location.state as LoginLocationState | null)?.from
      navigate(await getPostLoginPath(from ?? routePaths.dashboard), { replace: true })
    } catch (error) {
      setPasswordError(
        getApiErrorMessage(error, '아이디 또는 비밀번호를 확인한 뒤 다시 시도해주세요.'),
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  return {
    username,
    password,
    usernameError,
    passwordError,
    isPasswordVisible,
    keepSignedIn,
    isSubmitting,
    changeUsername,
    changePassword,
    togglePasswordVisibility: () => setIsPasswordVisible((visible) => !visible),
    toggleKeepSignedIn: () => setKeepSignedIn((checked) => !checked),
    submit,
    goToSignup: () => navigate(routePaths.signup),
    goToFindId: () => navigate(routePaths.findId),
    goToResetPassword: () => navigate(routePaths.resetPassword),
  }
}
