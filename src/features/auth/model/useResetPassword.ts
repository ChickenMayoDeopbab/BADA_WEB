import { changePassword } from '../api/authApi'
import { useEmailVerification } from './useEmailVerification'
import { validateLoginUsername, validatePassword, validatePasswordConfirm } from './validation'
import { getApiErrorMessage } from '@shared/api'
import { routePaths } from '@shared/config'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

export type ResetPasswordStep = 'verify' | 'password' | 'complete'

export type PasswordField = 'oldPassword' | 'newPassword' | 'newPasswordConfirm'

type PasswordValues = Record<PasswordField, string>

const EMPTY_PASSWORD_VALUES: PasswordValues = {
  oldPassword: '',
  newPassword: '',
  newPasswordConfirm: '',
}

const HIDDEN_PASSWORD_VALUES: Record<PasswordField, boolean> = {
  oldPassword: false,
  newPassword: false,
  newPasswordConfirm: false,
}

// 본인 인증 → 새 비밀번호 입력 → 완료로 이어지는 비밀번호 재설정 흐름을 관리합니다.
export const useResetPassword = () => {
  const navigate = useNavigate()
  const emailVerification = useEmailVerification('RESET_PASSWORD')
  const [step, setStep] = useState<ResetPasswordStep>('verify')
  const [username, setUsername] = useState('')
  const [usernameError, setUsernameError] = useState('')
  const [passwords, setPasswords] = useState<PasswordValues>(EMPTY_PASSWORD_VALUES)
  const [passwordErrors, setPasswordErrors] = useState<PasswordValues>(EMPTY_PASSWORD_VALUES)
  const [visiblePasswords, setVisiblePasswords] = useState(HIDDEN_PASSWORD_VALUES)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const changeUsername = (nextUsername: string) => {
    setUsername(nextUsername)
    setUsernameError('')
  }

  // 아이디 입력과 이메일 인증을 마치면 새 비밀번호 단계로 이동합니다.
  const submitVerifyStep = async () => {
    const nextUsernameError = validateLoginUsername(username)
    setUsernameError(nextUsernameError)

    const isVerified = await emailVerification.verifyCode()
    if (nextUsernameError || !isVerified) return

    setStep('password')
  }

  const changePasswordField = (field: PasswordField, value: string) => {
    setPasswords((previous) => ({ ...previous, [field]: value }))
    setPasswordErrors((previous) => ({ ...previous, [field]: '' }))
  }

  const togglePasswordVisibility = (field: PasswordField) => {
    setVisiblePasswords((previous) => ({ ...previous, [field]: !previous[field] }))
  }

  // 입력값을 검증한 뒤 비밀번호 변경을 요청합니다.
  const submitPasswordStep = async () => {
    if (isSubmitting) return

    const nextErrors: PasswordValues = {
      oldPassword: passwords.oldPassword ? '' : '기존 비밀번호를 입력해주세요.',
      newPassword: validatePassword(passwords.newPassword, '새 비밀번호를 입력해주세요.'),
      newPasswordConfirm: validatePasswordConfirm(
        passwords.newPasswordConfirm,
        passwords.newPassword,
        '새 비밀번호 확인을 입력해주세요.',
      ),
    }
    setPasswordErrors(nextErrors)
    if (Object.values(nextErrors).some(Boolean)) return

    setIsSubmitting(true)
    try {
      await changePassword({
        email: emailVerification.email.trim(),
        oldPassword: passwords.oldPassword,
        newPassword: passwords.newPassword,
      })
      setStep('complete')
    } catch (error) {
      setPasswordErrors((previous) => ({
        ...previous,
        oldPassword: getApiErrorMessage(error, '비밀번호 변경에 실패했습니다. 다시 시도해주세요.'),
      }))
    } finally {
      setIsSubmitting(false)
    }
  }

  return {
    step,
    username,
    usernameError,
    emailVerification,
    passwords,
    passwordErrors,
    visiblePasswords,
    isSubmitting,
    changeUsername,
    submitVerifyStep,
    changePasswordField,
    togglePasswordVisibility,
    submitPasswordStep,
    goToVerifyStep: () => setStep('verify'),
    goToFindId: () => navigate(routePaths.findId),
    goToLogin: () => navigate(routePaths.login, { replace: true }),
  }
}
