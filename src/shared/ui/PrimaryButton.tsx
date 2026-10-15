import type { ButtonHTMLAttributes } from 'react'

/** 주요 동작에 사용하는 공통 버튼을 표시합니다. */
export const PrimaryButton = ({
  children,
  className = '',
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement>) => (
  <button
    className={`px-6 py-3 rounded-control bg-primary-normal text-body font-bold text-label-button-text transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
    {...props}
  >
    {children}
  </button>
)
