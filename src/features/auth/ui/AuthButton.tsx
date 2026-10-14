import type { ButtonHTMLAttributes } from 'react'

type AuthButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  label: string
  variant?: 'primary' | 'secondary'
  /** large: 전체 너비 액션 버튼, small: 입력 필드 옆 보조 버튼 */
  size?: 'large' | 'small'
}

const variantClassName = {
  primary: 'bg-primary-normal text-label-button-text',
  secondary: 'bg-fill-normal text-label-normal',
}

const sizeClassName = {
  large: 'h-[51px] w-full',
  small: 'h-[50px] w-[124px] shrink-0',
}

const labelClassName = {
  large: 'text-headline2 font-bold',
  small: 'text-label font-bold',
}

// 전역 스타일의 button { font: inherit }가 유틸리티보다 우선하므로 글자 스타일은 라벨에 적용합니다.
// 인증 화면의 주요/보조 액션 버튼입니다.
export const AuthButton = ({
  label,
  variant = 'primary',
  size = 'large',
  type = 'button',
  className = '',
  ...props
}: AuthButtonProps) => (
  <button
    type={type}
    className={`px-3.5 flex items-center justify-center rounded-component font-bold transition-opacity disabled:cursor-not-allowed disabled:opacity-60 ${variantClassName[variant]} ${sizeClassName[size]} ${className}`}
    {...props}
  >
    <span className={labelClassName[size]}>{label}</span>
  </button>
)
