import badaLogo from '@shared/assets/auth/logo.svg'
import type { ReactNode } from 'react'

type AuthCardProps = {
  title: string
  description: string
  children: ReactNode
  /** branded·social: 로고가 있는 중앙 정렬 카드, plain: 로고 없이 제목만 있는 카드 */
  variant?: 'branded' | 'social' | 'plain'
  /** plain 카드의 제목 정렬입니다. */
  align?: 'left' | 'center'
  className?: string
}

const brandedCardClassName = {
  branded: 'max-w-[500px] gap-8 px-[50px] py-12 max-sm:px-6',
  social: 'max-w-[460px] gap-[39px] px-[30px] pt-[30px] pb-[70px] max-sm:px-5',
}

// 인증 화면에서 공통으로 사용하는 카드와 제목 영역입니다.
export const AuthCard = ({
  title,
  description,
  children,
  variant = 'branded',
  align = 'left',
  className = '',
}: AuthCardProps) => {
  if (variant !== 'plain') {
    return (
      <section
        className={`flex w-full flex-col items-center rounded-card border border-line-alternative bg-background-normal shadow-elevated-card ${brandedCardClassName[variant]} ${className}`}
      >
        <header className="gap-3 flex w-full flex-col items-center text-center">
          <img src={badaLogo} alt="Bada" />
          <h1 className="text-title1 font-bold text-label-strong">{title}</h1>
          <p className="text-body font-medium text-label-neutral">{description}</p>
        </header>
        {children}
      </section>
    )
  }

  return (
    <section
      className={`px-10 pb-10 max-sm:px-5 flex w-full max-w-[500px] flex-col rounded-card border border-line-alternative bg-background-normal pt-[38px] shadow-elevated-card ${className}`}
    >
      <header className={`gap-2 flex flex-col ${align === 'center' ? 'text-center' : ''}`}>
        <h1 className="text-title1 font-bold text-label-normal">{title}</h1>
        <p className="text-body font-medium text-label-alternative">{description}</p>
      </header>
      <div className="px-2.5 mt-[38px]">{children}</div>
    </section>
  )
}
