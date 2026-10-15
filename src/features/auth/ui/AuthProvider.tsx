import { AuthContext } from '../model/authContext'
import { useAuthState } from '../model/useAuthState'
import type { PropsWithChildren } from 'react'

/** 보호 경로에서 하나의 서버 인증 확인 결과를 공유합니다. */
export const AuthProvider = ({ children }: PropsWithChildren) => {
  const status = useAuthState()
  return <AuthContext.Provider value={status}>{children}</AuthContext.Provider>
}
