import type { PropsWithChildren } from 'react'

interface ServicePageContentProps extends PropsWithChildren {
  className?: string
}

/** 서비스 화면의 좌우 여백과 상단 시작 위치를 동일하게 유지합니다. */
export const ServicePageContent = ({ children, className = '' }: ServicePageContentProps) => (
  <main className={`min-w-0 px-10 pt-6 max-sm:px-4 max-sm:pt-5 flex-1 ${className}`}>
    {children}
  </main>
)
