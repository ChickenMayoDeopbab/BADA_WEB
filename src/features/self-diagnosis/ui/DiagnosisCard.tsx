import type { ReactNode } from 'react'

type DiagnosisCardProps = {
  children: ReactNode
  className?: string
}

// 자가진단 각 단계의 내용을 담는 중앙 카드입니다.
export const DiagnosisCard = ({ children, className = '' }: DiagnosisCardProps) => (
  <section
    className={`p-12 max-sm:px-6 flex w-full max-w-[640px] flex-col items-center rounded-card border border-line-alternative bg-background-normal shadow-elevated-card ${className}`}
  >
    {children}
  </section>
)
