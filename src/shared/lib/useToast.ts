import { useCallback, useEffect, useRef, useState } from 'react'

/** 새 메시지를 표시할 때마다 닫힘 시간을 갱신하고 3초 뒤 제거합니다. */
export const useToast = () => {
  const [message, setMessage] = useState('')
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  /** 현재 메시지와 예약된 닫힘 동작을 함께 정리합니다. */
  const dismissToast = useCallback(() => {
    if (timerRef.current !== null) clearTimeout(timerRef.current)
    timerRef.current = null
    setMessage('')
  }, [])

  /** 메시지를 표시하고 이전 타이머를 새 타이머로 교체합니다. */
  const showToast = useCallback((nextMessage: string) => {
    if (timerRef.current !== null) clearTimeout(timerRef.current)
    setMessage(nextMessage)
    timerRef.current = setTimeout(() => {
      timerRef.current = null
      setMessage('')
    }, 3000)
  }, [])

  useEffect(
    () => () => {
      if (timerRef.current !== null) clearTimeout(timerRef.current)
    },
    [],
  )

  return { message, showToast, dismissToast }
}
