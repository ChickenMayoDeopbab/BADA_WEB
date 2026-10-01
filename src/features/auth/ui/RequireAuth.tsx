import { hasAuthSession } from '../model/authSession'
import { env, routePaths } from '@shared/config'
import { Navigate, Outlet, useLocation } from 'react-router-dom'

// 인증이 필요한 경로에서 세션을 확인하고 로그인 화면으로 이동시킵니다.
export const RequireAuth = () => {
  const location = useLocation()

  if (!env.isAuthGuardEnabled || hasAuthSession()) {
    return <Outlet />
  }

  return <Navigate to={routePaths.login} replace state={{ from: location.pathname }} />
}
