import type { TrainingPeriod } from '@entities/training-record'
import { useEffect, useState } from 'react'

export interface TrainingRecordDateRange {
  start: Date
  end: Date
}

// 날짜의 시간 정보를 제거해 캘린더 비교 기준을 통일합니다.
const normalizeDate = (date: Date) => new Date(date.getFullYear(), date.getMonth(), date.getDate())

// 기준 날짜가 속한 달의 첫날을 반환합니다.
const getMonthStart = (date: Date) => new Date(date.getFullYear(), date.getMonth(), 1)

// 날짜를 지정한 일수만큼 이전으로 이동합니다.
const subtractDays = (date: Date, days: number) =>
  new Date(date.getFullYear(), date.getMonth(), date.getDate() - days)

// 날짜를 한 달 전 같은 날짜로 이동하되 짧은 달의 마지막 날을 넘지 않게 합니다.
const subtractOneMonth = (date: Date) => {
  const targetMonthLastDate = new Date(date.getFullYear(), date.getMonth(), 0).getDate()

  return new Date(
    date.getFullYear(),
    date.getMonth() - 1,
    Math.min(date.getDate(), targetMonthLastDate),
  )
}

// 기간 탭에 맞는 오늘 기준 날짜 범위를 계산합니다.
export const getTrainingPeriodDateRange = (
  period: TrainingPeriod,
  baseDate = new Date(),
): TrainingRecordDateRange => {
  const today = normalizeDate(baseDate)

  if (period === 'weekly') {
    return { start: subtractDays(today, 6), end: today }
  }

  if (period === 'monthly') {
    return { start: subtractOneMonth(today), end: today }
  }

  return { start: today, end: today }
}

// 훈련 기록 조회 범위를 선택하는 캘린더 상태를 관리합니다.
export const useTrainingRecordCalendar = () => {
  const initialRange = getTrainingPeriodDateRange('daily')
  const [isCalendarOpen, setIsCalendarOpen] = useState(false)
  const [isSelectingEnd, setIsSelectingEnd] = useState(false)
  const [visibleMonth, setVisibleMonth] = useState(getMonthStart(initialRange.start))
  const [appliedRange, setAppliedRange] = useState<TrainingRecordDateRange>(initialRange)
  const [draftRange, setDraftRange] = useState<TrainingRecordDateRange>(initialRange)

  // 적용된 날짜 범위를 복사해 캘린더를 엽니다.
  const handleOpenCalendar = () => {
    setDraftRange(appliedRange)
    setVisibleMonth(getMonthStart(appliedRange.start))
    setIsSelectingEnd(false)
    setIsCalendarOpen(true)
  }

  // 변경 중인 범위를 버리고 캘린더를 닫습니다.
  const handleCancelCalendar = () => {
    setDraftRange(appliedRange)
    setIsSelectingEnd(false)
    setIsCalendarOpen(false)
  }

  // 시작일과 종료일을 순서대로 선택합니다.
  const handleSelectDate = (date: Date) => {
    const selectedDate = normalizeDate(date)

    if (!isSelectingEnd) {
      setDraftRange({ start: selectedDate, end: selectedDate })
      setIsSelectingEnd(true)
      return
    }

    setDraftRange((currentRange) =>
      selectedDate < currentRange.start
        ? { start: selectedDate, end: currentRange.start }
        : { start: currentRange.start, end: selectedDate },
    )
    setIsSelectingEnd(false)
  }

  // 선택한 날짜 범위를 훈련 기록 조회 범위로 적용합니다.
  const handleApplyCalendar = () => {
    setAppliedRange(draftRange)
    setIsSelectingEnd(false)
    setIsCalendarOpen(false)
  }

  // 일별·주별·월별 탭에 맞는 오늘 기준 범위를 즉시 적용합니다.
  const handleApplyPeriodRange = (period: TrainingPeriod) => {
    const nextRange = getTrainingPeriodDateRange(period)

    setAppliedRange(nextRange)
    setDraftRange(nextRange)
    setVisibleMonth(getMonthStart(nextRange.end))
    setIsSelectingEnd(false)
    setIsCalendarOpen(false)
  }

  // 캘린더를 이전 달로 이동합니다.
  const handlePreviousMonth = () => {
    setVisibleMonth(
      (currentMonth) => new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1),
    )
  }

  // 캘린더를 다음 달로 이동합니다.
  const handleNextMonth = () => {
    setVisibleMonth(
      (currentMonth) => new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1),
    )
  }

  useEffect(() => {
    if (!isCalendarOpen) {
      return
    }

    // Escape 키로 캘린더를 닫습니다.
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setDraftRange(appliedRange)
        setIsSelectingEnd(false)
        setIsCalendarOpen(false)
      }
    }

    window.addEventListener('keydown', handleEscape)

    return () => window.removeEventListener('keydown', handleEscape)
  }, [appliedRange, isCalendarOpen])

  return {
    isCalendarOpen,
    isSelectingEnd,
    visibleMonth,
    appliedRange,
    draftRange,
    handleOpenCalendar,
    handleCancelCalendar,
    handleSelectDate,
    handleApplyCalendar,
    handleApplyPeriodRange,
    handlePreviousMonth,
    handleNextMonth,
  }
}
