import { useId, type InputHTMLAttributes, type ReactNode } from 'react'

type AuthTextFieldProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'onChange'> & {
  label: string
  onValueChange: (value: string) => void
  error?: string
  success?: string
  trailing?: ReactNode
  /** underline: 로고 카드의 밑줄 입력 필드, inset: 일반 카드의 들여쓴 입력 필드 */
  variant?: 'underline' | 'inset'
}

// 인증 화면의 입력 필드와 오류·안내 메시지를 함께 렌더링합니다.
export const AuthTextField = ({
  label,
  onValueChange,
  error = '',
  success = '',
  trailing,
  variant = 'underline',
  className = '',
  ...props
}: AuthTextFieldProps) => {
  const id = useId()
  const messageId = `${id}-message`
  const message = error || success

  const lineClassName = error ? 'border-status-error' : 'focus-within:border-label-normal'

  return (
    <div className={`gap-1 flex w-full flex-col ${className}`}>
      <label htmlFor={id} className="sr-only">
        {label}
      </label>
      {variant === 'underline' && <div className="h-[18px]" aria-hidden="true" />}
      <div
        className={
          variant === 'underline'
            ? `h-10 gap-2 py-2.5 flex items-center border-b border-line-normal ${lineClassName}`
            : `gap-2 px-4 flex h-[52px] items-center border-b-2 border-line-alternative ${lineClassName}`
        }
      >
        <input
          id={id}
          aria-invalid={Boolean(error)}
          aria-describedby={message ? messageId : undefined}
          className="min-w-0 flex-1 bg-transparent text-label-normal outline-none placeholder:text-label-alternative"
          onChange={(event) => onValueChange(event.target.value)}
          {...props}
        />
        {trailing}
      </div>
      <p
        id={messageId}
        role={error ? 'alert' : undefined}
        className={`min-h-4 text-caption ${error ? 'text-status-error' : 'text-green-40'}`}
      >
        {message}
      </p>
    </div>
  )
}
