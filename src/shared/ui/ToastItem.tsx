import { useTranslation } from '@shared/lib'
import { useEffect, useEffectEvent, useState } from 'react'
import { experienceConfig } from '@shared/config'
import type { ToastMessage } from './toastContext'

/** 읽거나 마우스를 올린 알림은 유지하고 닫기 버튼으로 제거할 수 있습니다. */
export const ToastItem = ({ toast, onDismiss }: { toast: ToastMessage; onDismiss: () => void }) => {
  const { t } = useTranslation()

  const [isHovered, setIsHovered] = useState(false)
  const [isFocused, setIsFocused] = useState(false)
  const dismiss = useEffectEvent(onDismiss)
  const duration = toast.duration ?? experienceConfig.durations.toast
  useEffect(() => {
    if (isHovered || isFocused) return
    const timer = window.setTimeout(() => dismiss(), duration)
    return () => window.clearTimeout(timer)
  }, [duration, isHovered, isFocused])
  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onFocus={() => setIsFocused(true)}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setIsFocused(false)
      }}
      className="ux-overlay gap-3 p-4 flex items-center rounded-component border border-line-alternative bg-background-normal shadow-elevated-card"
    >
      <span
        aria-hidden="true"
        className={toast.kind === 'error' ? 'text-status-error' : 'text-green-40'}
      >
        {toast.kind === 'error' ? '!' : '✓'}
      </span>
      <p
        role={toast.kind === 'error' ? 'alert' : 'status'}
        className="flex-1 text-label text-label-normal"
      >
        {t(toast.message)}
      </p>
      <button
        type="button"
        className="size-8 shrink-0 rounded-control text-label-alternative"
        aria-label={t('알림 닫기')}
        onClick={onDismiss}
      >
        ×
      </button>
    </div>
  )
}
