import { Outlet } from 'react-router-dom'
import { usePublicPageNavigation } from '../model/usePublicPageNavigation'

/** 랜딩과 공개 정책 문서의 페이지 이동 경험을 공유합니다. */
export const PublicLayout = () => {
  usePublicPageNavigation()
  return <Outlet />
}
