import { AppSidebar } from '@widgets/app-sidebar'
import { useEffect, useRef } from 'react'
import { Outlet, useLocation } from 'react-router-dom'

// 로그인 이후 서비스 페이지에 공통 사이드바 레이아웃을 제공합니다.
export const ServiceLayout = () => {
  const { pathname } = useLocation()
  const contentRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    contentRef.current?.scrollTo({ top: 0, left: 0 })
  }, [pathname])

  return (
    <div className="gap-4 p-4 max-md:p-0 min-w-0 flex h-dvh overflow-hidden bg-background-alternative">
      <AppSidebar />
      <div
        ref={contentRef}
        data-scroll-lock-target
        className="max-md:pb-24 min-h-0 min-w-0 flex-1 overflow-x-hidden overflow-y-auto overscroll-contain"
      >
        <div key={pathname} className="ux-page min-w-0 flex min-h-full flex-col">
          <Outlet />
        </div>
      </div>
    </div>
  )
}
