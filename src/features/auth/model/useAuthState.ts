import {
  getAuthSessionKey,
  getAuthSessionVersion,
  subscribeAuthSession,
  clearAuthSession,
} from './authSession'
import { getValidAccessToken } from './getValidAccessToken'
import type { AuthStatus } from './authContext'
import { getCurrentUser } from '@entities/user'
import { useQueryClient } from '@tanstack/react-query'
import { useEffect, useRef, useState, useSyncExternalStore } from 'react'

/** 서버가 확인한 현재 세션만 인증 완료로 공개하고 이전 요청의 응답은 무시합니다. */
export const useAuthState = (): AuthStatus => {
  const sessionKey = useSyncExternalStore(subscribeAuthSession, getAuthSessionKey, () => '')
  const queryClient = useQueryClient()
  const sessionVersion = getAuthSessionVersion()
  const [verifiedVersion, setVerifiedVersion] = useState<number | null>(null)
  const cachedVersion = useRef<number | null>(null)

  useEffect(() => {
    if (!sessionKey) {
      queryClient.clear()
      return
    }
    if (cachedVersion.current !== sessionVersion) {
      queryClient.clear()
      cachedVersion.current = sessionVersion
    }
    const controller = new AbortController()

    /** 만료 토큰 갱신과 서버 사용자 확인을 모두 마친 뒤 보호 화면을 허용합니다. */
    const verifySession = async () => {
      try {
        await getValidAccessToken()
        if (controller.signal.aborted || getAuthSessionKey() !== sessionKey) return
        const user = await getCurrentUser(controller.signal)
        if (!user) throw new Error('AUTH_REQUIRED')
        if (!controller.signal.aborted && getAuthSessionKey() === sessionKey)
          setVerifiedVersion(sessionVersion)
      } catch {
        if (!controller.signal.aborted && getAuthSessionKey() === sessionKey) clearAuthSession()
      }
    }

    void verifySession()
    return () => controller.abort()
  }, [sessionKey, sessionVersion, queryClient])

  if (!sessionKey) return 'unauthenticated'
  return verifiedVersion === sessionVersion ? 'authenticated' : 'checking'
}
