import { useEffect, useEffectEvent, useRef, useState } from 'react'
import { experienceConfig } from '@shared/config'

/** 호버·키보드 포커스 중에는 남은 시간을 보존하고 퇴장 효과가 끝나면 제거합니다. */
export const useToastLifetime = (duration: number, onDismiss: () => void) => {
  const [isHovered, setIsHovered] = useState(false)
  const [isFocused, setIsFocused] = useState(false)
  const [isExiting, setIsExiting] = useState(false)
  const remaining = useRef(duration)
  const dismiss = useEffectEvent(onDismiss)
  const isPaused = isHovered || isFocused

  useEffect(() => {
    if (isPaused || isExiting) return
    const startedAt = performance.now()
    const timer = window.setTimeout(() => setIsExiting(true), remaining.current)
    return () => {
      window.clearTimeout(timer)
      remaining.current = Math.max(0, remaining.current - (performance.now() - startedAt))
    }
  }, [isExiting, isPaused])

  useEffect(() => {
    if (!isExiting) return
    const isReducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false
    const delay =
      experienceConfig.toastMotion && !isReducedMotion ? experienceConfig.durations.toastExit : 0
    const timer = window.setTimeout(() => dismiss(), delay)
    return () => window.clearTimeout(timer)
  }, [isExiting])

  return {
    isExiting,
    isPaused,
    setIsHovered,
    setIsFocused,
    handleDismiss: () => setIsExiting(true),
  }
}
