import { signout } from '../api/authApi'
import { clearAuthSession } from './authSession'
import { getApiErrorMessage } from '@shared/api'
import { routePaths } from '@shared/config'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'

/** 서버 세션을 종료한 뒤 브라우저 인증과 사용자 캐시를 정리합니다. */
export const useLogout = () => {
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const mutation = useMutation({
    mutationFn: signout,
    onSuccess: async () => {
      clearAuthSession()
      await queryClient.cancelQueries()
      queryClient.clear()
      navigate(routePaths.landing, { replace: true })
    },
  })

  /** 서버 응답을 기다리는 동안 로그아웃을 중복 요청하지 않습니다. */
  const handleLogout = () => {
    if (!mutation.isPending) mutation.mutate()
  }

  return {
    handleLogout,
    isLoggingOut: mutation.isPending,
    logoutError: mutation.isError
      ? getApiErrorMessage(mutation.error, '로그아웃하지 못했습니다. 다시 시도해 주세요.')
      : '',
  }
}
