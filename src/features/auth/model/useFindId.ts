import { findId } from '../api/authApi'
import { useEmailVerification } from './useEmailVerification'
import { routePaths } from '@shared/config'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

export type FindIdStatus = 'form' | 'success' | 'fail'

// 이메일 인증 후 가입된 아이디를 조회하는 흐름을 관리합니다.
export const useFindId = () => {
  const navigate = useNavigate()
  const emailVerification = useEmailVerification('FIND_ID')
  const [status, setStatus] = useState<FindIdStatus>('form')
  const [foundUsername, setFoundUsername] = useState('')
  const [isSearching, setIsSearching] = useState(false)

  // 인증코드 확인에 성공하면 아이디를 조회해 결과 화면을 보여줍니다.
  const submit = async () => {
    if (isSearching || !(await emailVerification.verifyCode())) return

    setIsSearching(true)
    try {
      const username = await findId(emailVerification.email.trim())

      setFoundUsername(username ?? '')
      setStatus(username ? 'success' : 'fail')
    } catch {
      setStatus('fail')
    } finally {
      setIsSearching(false)
    }
  }

  // 실패 화면에서 입력 화면으로 돌아가 다시 인증할 수 있게 합니다.
  const retry = () => {
    emailVerification.resetCode()
    setStatus('form')
  }

  return {
    status,
    foundUsername,
    emailVerification,
    isSearching,
    submit,
    retry,
    goToLogin: () => navigate(routePaths.login),
    goToResetPassword: () => navigate(routePaths.resetPassword),
  }
}
