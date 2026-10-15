import { useAuthSession } from '../model/useAuthSession'
import { routePaths } from '@shared/config'
import { Navigate, Outlet, useLocation } from 'react-router-dom'

// 인증이 필요한 경로는 세션이 없는 경우 랜딩 화면으로 이동시킵니다.
export const RequireAuth = () => {
  // 같은 탭에서 저장소를 직접 비운 경우도 다음 경로 이동 때 확인합니다.
  useLocation()
  const status = useAuthSession()

  if (status === 'checking') return null
  if (status === 'authenticated') {
    return <Outlet />
  }

  return <Navigate to={routePaths.landing} replace />
}
