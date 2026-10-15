import { createContext, useContext } from 'react'

export interface ToastMessage {
  message: string
  kind?: 'success' | 'error'
  position?: 'top-right' | 'bottom-right'
  duration?: number
}
export const ToastContext = createContext<(toast: ToastMessage) => void>(() => {})
/** 실제 작업 결과를 전역 피드백으로 표시합니다. */
export const useToast = () => useContext(ToastContext)
