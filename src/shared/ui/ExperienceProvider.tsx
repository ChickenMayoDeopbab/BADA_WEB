import { useTranslation } from '@shared/lib'
import { useCallback, useLayoutEffect, useState, type PropsWithChildren } from 'react'
import { experienceConfig } from '@shared/config'
import { ToastContext, type ToastMessage } from './toastContext'
import { ToastItem } from './ToastItem'

/** 공통 효과 설정과 작업 결과 알림을 제공합니다. 페이지/데이터 상태를 변경하지 않습니다. */
export const ExperienceProvider = ({ children }: PropsWithChildren) => {
  const { t } = useTranslation()

  const [toasts, setToasts] = useState<(ToastMessage & { id: number })[]>([])
  useLayoutEffect(() => {
    const root = document.documentElement
    const flags = {
      page: experienceConfig.pageMotion,
      drawer: experienceConfig.drawerMotion,
      interactions: experienceConfig.interactions,
      overlay: experienceConfig.overlayMotion,
      skeleton: experienceConfig.skeletonMotion,
      spinner: experienceConfig.spinnerMotion,
    }
    Object.entries(flags).forEach(([key, value]) => {
      root.dataset[`ux${key[0].toUpperCase()}${key.slice(1)}`] = String(value)
    })
    Object.entries(experienceConfig.durations).forEach(([key, value]) =>
      root.style.setProperty(
        `--ux-${key}-duration`,
        `${(key === 'tab' && !experienceConfig.tabMotion) || (key === 'accordion' && !experienceConfig.accordionMotion) || (key === 'toggle' && !experienceConfig.toggleMotion) ? 0 : value}ms`,
      ),
    )
    return () => {
      Object.keys(flags).forEach((key) => {
        delete root.dataset[`ux${key[0].toUpperCase()}${key.slice(1)}`]
      })
      Object.keys(experienceConfig.durations).forEach((key) =>
        root.style.removeProperty(`--ux-${key}-duration`),
      )
    }
  }, [])
  // 중복 알림을 합치고 한 번에 표시할 개수를 제한합니다.
  const notify = useCallback((toast: ToastMessage) => {
    if (!experienceConfig.toasts) return
    setToasts((current) =>
      current.some((item) => item.message === toast.message)
        ? current
        : [...current, { ...toast, id: Date.now() + Math.random() }].slice(-3),
    )
  }, [])
  // 선택한 알림만 제거합니다.
  const dismiss = useCallback(
    (id: number) => setToasts((current) => current.filter((item) => item.id !== id)),
    [],
  )
  return (
    <ToastContext value={notify}>
      {children}
      <div aria-label={t('작업 결과 알림')}>
        {(['top-right', 'bottom-right'] as const).map((position) => (
          <div
            key={position}
            className={`gap-2 fixed z-[100] flex w-[360px] max-w-[calc(100%-32px)] flex-col ${position === 'top-right' ? 'right-6 top-6 max-sm:right-4 max-sm:top-4' : 'right-5 bottom-5 max-md:right-4 max-md:bottom-24'}`}
          >
            {toasts
              .filter((toast) => (toast.position ?? 'bottom-right') === position)
              .map((toast) => (
                <ToastItem key={toast.id} toast={toast} onDismiss={() => dismiss(toast.id)} />
              ))}
          </div>
        ))}
      </div>
    </ToastContext>
  )
}
