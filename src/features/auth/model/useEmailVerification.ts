import { checkEmailCode, sendEmailCode } from '../api/authApi'
import type { EmailVerificationType } from './types'
import { validateAuthCode, validateEmail } from './validation'
import { getApiErrorMessage } from '@shared/api'
import { useState } from 'react'

// 이메일 인증코드 전송과 확인 상태를 관리합니다.
export const useEmailVerification = (type: EmailVerificationType) => {
  const [email, setEmail] = useState('')
  const [authCode, setAuthCode] = useState('')
  const [emailError, setEmailError] = useState('')
  const [authCodeError, setAuthCodeError] = useState('')
  const [isSent, setIsSent] = useState(false)
  const [isSending, setIsSending] = useState(false)
  const [isVerifying, setIsVerifying] = useState(false)
  const [verifiedEmail, setVerifiedEmail] = useState<string | null>(null)

  // 이메일이 바뀌면 이전 전송 상태를 무효화합니다.
  const changeEmail = (nextEmail: string) => {
    setEmail(nextEmail)
    setEmailError('')
    setIsSent(false)
    setVerifiedEmail(null)
  }

  const changeAuthCode = (nextAuthCode: string) => {
    setAuthCode(nextAuthCode)
    setAuthCodeError('')
    setVerifiedEmail(null)
  }

  // 입력한 이메일로 인증코드를 전송합니다.
  const sendCode = async () => {
    if (isSending) return

    const validationError = validateEmail(email)
    setEmailError(validationError)
    if (validationError) return

    setIsSending(true)
    try {
      await sendEmailCode({ email: email.trim(), type })
      setIsSent(true)
      setVerifiedEmail(null)
    } catch (error) {
      setIsSent(false)
      setEmailError(getApiErrorMessage(error, '인증코드 전송에 실패했습니다. 다시 시도해주세요.'))
    } finally {
      setIsSending(false)
    }
  }

  // 인증코드를 확인하고 성공 여부를 반환합니다. 이미 인증한 이메일이면 다시 요청하지 않습니다.
  const verifyCode = async () => {
    if (isVerifying) return false
    if (verifiedEmail !== null && verifiedEmail === email.trim()) return true

    const nextEmailError = validateEmail(email)
    const nextAuthCodeError = validateAuthCode(authCode)
    setEmailError(nextEmailError)
    setAuthCodeError(nextAuthCodeError)
    if (nextEmailError || nextAuthCodeError) return false

    if (!isSent) {
      setEmailError('먼저 인증코드를 전송해주세요.')
      return false
    }

    setIsVerifying(true)
    try {
      await checkEmailCode({ email: email.trim(), authNum: authCode.trim(), type })
      setVerifiedEmail(email.trim())
      return true
    } catch (error) {
      setAuthCodeError(
        getApiErrorMessage(error, '인증코드 확인에 실패했습니다. 다시 시도해주세요.'),
      )
      return false
    } finally {
      setIsVerifying(false)
    }
  }

  // 인증 단계를 처음부터 다시 진행할 수 있도록 코드 입력을 초기화합니다.
  const resetCode = () => {
    setAuthCode('')
    setAuthCodeError('')
    setIsSent(false)
    setVerifiedEmail(null)
  }

  return {
    email,
    authCode,
    emailError,
    authCodeError,
    isSent,
    isSending,
    isVerifying,
    changeEmail,
    changeAuthCode,
    sendCode,
    verifyCode,
    resetCode,
  }
}

export type EmailVerification = ReturnType<typeof useEmailVerification>
