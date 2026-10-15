import { hasAuthSession, subscribeAuthSession } from './authSession'
import { useEffect, useSyncExternalStore } from 'react'
import { useQueryClient } from '@tanstack/react-query'

/** 저장소 변경과 토큰 만료를 현재 라우트의 인증 상태에 즉시 반영합니다. */
export const useAuthSession = () => {
  const hasSession = useSyncExternalStore(subscribeAuthSession, hasAuthSession, () => false)
  const queryClient = useQueryClient()

  useEffect(() => {
    // 다른 탭 로그아웃과 만료 후에도 이전 사용자의 데이터를 남기지 않습니다.
    if (!hasSession) queryClient.clear()
  }, [hasSession, queryClient])

  return hasSession
}
