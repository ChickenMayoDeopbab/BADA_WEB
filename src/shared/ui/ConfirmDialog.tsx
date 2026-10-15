import { useTranslation } from '@shared/lib'
import { lockPageScroll } from '@shared/lib'
import { useEffect, useId, useRef, type ReactNode } from 'react'

interface Props {
  title: string
  description: string
  confirmLabel: string
  pending?: boolean
  danger?: boolean
  error?: string
  children?: ReactNode
  confirmDisabled?: boolean
  onClose: () => void
  onConfirm: () => void
}

export const ConfirmDialog = ({
  title,
  description,
  confirmLabel,
  pending,
  danger,
  error,
  children,
  confirmDisabled,
  onClose,
  onConfirm,
}: Props) => {
  const { t } = useTranslation()

  const ref = useRef<HTMLDialogElement>(null)
  const id = useId()
  useEffect(() => {
    const dialog = ref.current
    const focused = document.activeElement as HTMLElement | null
    dialog?.showModal()
    const releaseScroll = lockPageScroll()
    return () => {
      dialog?.close()
      releaseScroll()
      if (focused?.isConnected) focused.focus({ preventScroll: true })
    }
  }, [])
  return (
    <dialog
      ref={ref}
      aria-labelledby={id}
      aria-describedby={`${id}-description`}
      onCancel={(event) => {
        event.preventDefault()
        if (!pending) onClose()
      }}
      onClick={(event) => {
        if (event.target === ref.current && !pending) {
          const r = ref.current.getBoundingClientRect()
          if (
            event.clientX < r.left ||
            event.clientX > r.right ||
            event.clientY < r.top ||
            event.clientY > r.bottom
          )
            onClose()
        }
      }}
      className="p-5 backdrop:bg-black/40 m-auto w-[calc(100%-32px)] max-w-[360px] rounded-dialog border-0 bg-background-normal text-label-normal shadow-elevated-card"
    >
      <h2 id={id} className="text-headline2 font-bold">
        {title}
      </h2>
      <p
        id={`${id}-description`}
        className="mt-2 text-label whitespace-pre-line text-label-alternative"
      >
        {description}
      </p>
      {children}
      {error && (
        <p role="alert" className="mt-3 text-label text-status-error">
          {error}
        </p>
      )}
      <div className="mt-4 gap-3 grid grid-cols-2">
        <button
          type="button"
          autoFocus
          disabled={pending}
          onClick={onClose}
          className="h-10 rounded-control bg-fill-normal text-label font-bold disabled:opacity-50"
        >
          {t('취소')}
        </button>
        <button
          type="button"
          disabled={pending || confirmDisabled}
          onClick={onConfirm}
          className={`h-10 rounded-control text-label font-bold text-common-0 disabled:opacity-50 ${danger ? 'bg-status-error' : 'bg-primary-normal'}`}
        >
          {pending ? '처리 중' : confirmLabel}
        </button>
      </div>
    </dialog>
  )
}
