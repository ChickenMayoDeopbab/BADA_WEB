import { useState } from 'react'
import { getDashboardToday, validateDashboardDetailsPeriod } from './dashboardDetails'

type DateField = 'from' | 'to'
interface DateRange {
  from: string
  to: string
}

/** 시간대 변환 없이 달력 날짜를 API의 날짜 키로 만듭니다. */
const toDateKey = (date: Date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`

/** 월별 달력의 빈칸과 날짜를 여섯 주로 구성합니다. */
const getCalendarDays = (month: string) => {
  const [year, monthNumber] = month.split('-').map(Number)
  const offset = new Date(year, monthNumber - 1, 1).getDay()
  const count = new Date(year, monthNumber, 0).getDate()
  return Array.from({ length: 42 }, (_, index) => {
    const day = index - offset + 1
    return day > 0 && day <= count ? toDateKey(new Date(year, monthNumber - 1, day)) : null
  })
}

/** 캘린더에서 임시로 날짜를 선택하고 확인한 범위만 조회 조건에 반영합니다. */
export const useDashboardDateCalendar = (range: DateRange, onApply: (range: DateRange) => void) => {
  const [isOpen, setIsOpen] = useState(false)
  const [activeField, setActiveField] = useState<DateField>('from')
  const [selection, setSelection] = useState(range)
  const [visibleMonth, setVisibleMonth] = useState(range.from.slice(0, 7))
  const today = getDashboardToday()
  const error = validateDashboardDetailsPeriod(selection, today)

  /** 선택한 날짜 입력의 월을 열고 적용 전 범위를 복사합니다. */
  const handleOpen = (field: DateField) => {
    setSelection({ from: range.from, to: range.to })
    setActiveField(field)
    setVisibleMonth(range[field].slice(0, 7))
    setIsOpen(true)
  }

  /** 임시 선택을 버리고 원래 조회 조건으로 돌아갑니다. */
  const handleCancel = () => setIsOpen(false)

  /** 시작일과 종료일 중 편집할 날짜로 달력의 월을 이동합니다. */
  const handleChangeField = (field: DateField) => {
    setActiveField(field)
    setVisibleMonth(selection[field].slice(0, 7))
  }

  /** 날짜 순서를 유지하고 시작일을 고른 뒤 종료일 선택으로 이어갑니다. */
  const handleSelectDate = (date: string) => {
    if (date < '2000-01-01' || date > today) return
    setSelection((current) =>
      activeField === 'from'
        ? { from: date, to: date > current.to ? date : current.to }
        : { from: date < current.from ? date : current.from, to: date },
    )
    if (activeField === 'from') setActiveField('to')
  }

  /** 지원하는 기간 안에서 이전 또는 다음 달로 이동합니다. */
  const handleChangeMonth = (offset: number) => {
    const [year, month] = visibleMonth.split('-').map(Number)
    const next = toDateKey(new Date(year, month - 1 + offset, 1)).slice(0, 7)
    if (next >= '2000-01' && next <= today.slice(0, 7)) setVisibleMonth(next)
  }

  /** 유효한 날짜 범위만 반영하며 서버 조회는 상위 폼의 적용 버튼에 맡깁니다. */
  const handleApply = () => {
    if (error) return
    onApply(selection)
    setIsOpen(false)
  }

  return {
    isOpen,
    activeField,
    selection,
    visibleMonth,
    days: getCalendarDays(visibleMonth),
    today,
    error,
    canGoPrevious: visibleMonth > '2000-01',
    canGoNext: visibleMonth < today.slice(0, 7),
    handleOpen,
    handleCancel,
    handleChangeField,
    handleSelectDate,
    handleChangeMonth,
    handleApply,
  }
}

export type DashboardDateCalendarModel = ReturnType<typeof useDashboardDateCalendar>
