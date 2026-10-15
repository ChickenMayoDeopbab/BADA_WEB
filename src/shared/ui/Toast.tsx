import { FiCheckCircle, FiX } from 'react-icons/fi'

interface ToastProps {
  message: string
  onDismiss: () => void
}

/** 작업 완료 메시지를 화면 오른쪽 위에 표시합니다. */
export const Toast = ({ message, onDismiss }: ToastProps) => {
  if (!message) return null

  return (
    <div
      role="status"
      aria-live="polite"
      aria-atomic="true"
      className="right-6 top-6 gap-3 px-5 py-4 max-sm:right-4 max-sm:top-4 fixed z-50 flex max-w-[calc(100%-32px)] items-center rounded-component border border-line-alternative bg-background-normal text-label text-label-normal shadow-elevated-card motion-safe:animate-[toast-enter_200ms_ease-out]"
    >
      <FiCheckCircle className="size-5 shrink-0 text-primary-normal" aria-hidden="true" />
      <span>{message}</span>
      <button
        type="button"
        onClick={onDismiss}
        aria-label="메시지 닫기"
        className="p-1 rounded-control text-label-alternative hover:bg-fill-normal"
      >
        <FiX aria-hidden="true" />
      </button>
    </div>
  )
}
