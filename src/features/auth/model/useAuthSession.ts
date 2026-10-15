import { AuthContext } from './authContext'
import { useContext } from 'react'

/** 공통 제공자가 확인한 서버 인증 상태를 읽습니다. */
export const useAuthSession = () => {
  const status = useContext(AuthContext)
  if (status === null) throw new Error('AuthProvider가 필요합니다.')
  return status
}
