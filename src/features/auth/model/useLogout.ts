import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { signout } from '../api/authApi'
import { clearAuthSession } from './authSession'
import { routePaths } from '@shared/config'

/** 서버 로그아웃이 성공한 뒤 진행 중 조회·사용자 캐시·로컬 인증을 정리합니다. */
export const useLogout = () => {
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  return useMutation({
    mutationFn: signout,
    retry: false,
    onSuccess: async () => {
      await queryClient.cancelQueries()
      clearAuthSession()
      queryClient.clear()
      navigate(routePaths.landing, { replace: true })
    },
  })
}
