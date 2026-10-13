import type { ButtonHTMLAttributes } from 'react'

type DiagnosisButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  label: string
  variant?: 'primary' | 'secondary'
}

const variantClassName = {
  primary: 'bg-primary-normal text-label-button-text',
  secondary: 'bg-fill-normal text-label-normal',
}

// 전역 스타일의 button { font: inherit }가 유틸리티보다 우선하므로 글자 스타일은 라벨에 적용합니다.
// 자가진단 카드 하단의 전체 너비 액션 버튼입니다.
export const DiagnosisButton = ({
  label,
  variant = 'primary',
  type = 'button',
  className = '',
  ...props
}: DiagnosisButtonProps) => (
  <button
    type={type}
    className={`px-3.5 flex h-[51px] w-full items-center justify-center rounded-component transition-opacity disabled:cursor-not-allowed disabled:opacity-40 ${variantClassName[variant]} ${className}`}
    {...props}
  >
    <span className="text-headline2 font-bold">{label}</span>
  </button>
)
