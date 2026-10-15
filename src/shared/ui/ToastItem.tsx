import { useToastLifetime } from './model/useToastLifetime'
import { experienceConfig } from '@shared/config'
import type { ToastMessage } from './toastContext'

/** 읽거나 마우스를 올린 알림은 유지하고 닫기 버튼으로 제거할 수 있습니다. */
export const ToastItem = ({ toast, onDismiss }: { toast: ToastMessage; onDismiss: () => void }) => {
  const duration = toast.duration ?? experienceConfig.durations.toast
  const lifetime = useToastLifetime(duration, onDismiss)
  return (
    <div
      data-toast-state={lifetime.isExiting ? 'exiting' : 'visible'}
      onMouseEnter={() => lifetime.setIsHovered(true)}
      onMouseLeave={() => lifetime.setIsHovered(false)}
      onFocus={() => lifetime.setIsFocused(true)}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) lifetime.setIsFocused(false)
      }}
      className={`gap-3 p-4 pb-5 relative flex items-center overflow-hidden rounded-component border border-line-alternative bg-background-normal shadow-elevated-card ${lifetime.isExiting ? 'ux-toast-exit pointer-events-none' : ''}`}
    >
      <span
        aria-hidden="true"
        className={toast.kind === 'error' ? 'text-status-error' : 'text-primary-normal'}
      >
        {toast.kind === 'error' ? '!' : '✓'}
      </span>
      <p
        role={toast.kind === 'error' ? 'alert' : 'status'}
        className="flex-1 text-label text-label-normal"
      >
        {toast.message}
      </p>
      <button
        type="button"
        className="size-8 shrink-0 rounded-control text-label-alternative"
        aria-label={'알림 닫기'}
        onClick={lifetime.handleDismiss}
      >
        ×
      </button>
      <span aria-hidden="true" className="inset-x-0 bottom-0 h-1 absolute bg-fill-normal">
        <span
          data-toast-progress
          className={`ux-toast-countdown block size-full origin-left ${toast.kind === 'error' ? 'bg-status-error' : 'bg-primary-normal'}`}
          style={{
            animationDuration: `${duration}ms`,
            animationPlayState: lifetime.isPaused || lifetime.isExiting ? 'paused' : 'running',
          }}
        />
      </span>
    </div>
  )
}
