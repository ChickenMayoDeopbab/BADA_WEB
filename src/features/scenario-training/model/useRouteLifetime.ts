import { useCallback, useLayoutEffect, useRef, useState } from 'react'
import { useLocation } from 'react-router-dom'

/** 떠난 화면의 비동기 응답이 전환 중인 라우트를 되돌리지 않도록 현재 URL도 확인합니다. */
export const useRouteLifetime = () => {
  const location = useLocation()
  const [pathname] = useState(location.pathname)
  const isMounted = useRef(false)
  useLayoutEffect(() => {
    isMounted.current = true
    return () => {
      isMounted.current = false
    }
  }, [])
  return useCallback(() => isMounted.current && window.location.pathname === pathname, [pathname])
}
