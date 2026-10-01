import { AppSidebar } from '@widgets/app-sidebar'
import { Outlet } from 'react-router-dom'

// 로그인 이후 서비스 페이지에 공통 사이드바 레이아웃을 제공합니다.
export const ServiceLayout = () => (
  <div className="gap-4 p-4 flex min-h-screen min-w-[1180px] items-start bg-[#f3f4f6]">
    <AppSidebar />
    <Outlet />
  </div>
)
