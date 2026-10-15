import type { ReactNode } from 'react'

type AuthLayoutProps = {
  children: ReactNode
}

// 인증 화면의 배경과 카드 중앙 정렬을 담당합니다.
export const AuthLayout = ({ children }: AuthLayoutProps) => (
  <main className="ux-page px-4 py-10 flex min-h-screen w-full items-center justify-center bg-background-alternative">
    {children}
  </main>
)
