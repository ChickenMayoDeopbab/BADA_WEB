import { useEffect, useRef } from 'react'

const minuteItemHeight = 44
export const minuteValues = Array.from({ length: 61 }, (_, index) => index)

/** 기존 발신 시간 휠의 스크롤 위치와 선택값을 동기화합니다. */
export const useMinutePicker = (selected: number, onChange: (minute: number) => void) => {
  const scrollRef = useRef<HTMLDivElement>(null)
  const isInitializedRef = useRef(false)
  useEffect(() => {
    const element = scrollRef.current
    if (!element || isInitializedRef.current) return
    isInitializedRef.current = true
    element.scrollTop = selected * minuteItemHeight
  }, [selected])

  /** 스크롤 중심의 분 단위 선택을 설정에 반영합니다. */
  const handleScroll = () => {
    const element = scrollRef.current
    if (!element) return
    const minute = Math.min(60, Math.max(0, Math.round(element.scrollTop / minuteItemHeight)))
    if (minute !== selected) onChange(minute)
  }

  /** 클릭한 시간을 휠 중앙으로 이동합니다. */
  const handleSelect = (minute: number) => {
    onChange(minute)
    scrollRef.current?.scrollTo({ top: minute * minuteItemHeight, behavior: 'smooth' })
  }
  return { scrollRef, handleScroll, handleSelect }
}
