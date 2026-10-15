import { useMonthlyAttendance } from '@entities/attendance'
import { toDateKey } from '@shared/lib'
import { useState } from 'react'

export interface CalendarDay {
  dateKey: string
  date: number
  isAttended: boolean
}

// 해당 월의 날짜를 일요일 시작 주 단위로 나눕니다. 앞뒤 빈 칸은 null입니다.
export const getCalendarWeeks = (year: number, monthIndex: number) => {
  const firstWeekday = new Date(year, monthIndex, 1).getDay()
  const lastDate = new Date(year, monthIndex + 1, 0).getDate()
  const cells = [
    ...Array.from({ length: firstWeekday }, () => null),
    ...Array.from({ length: lastDate }, (_, index) => new Date(year, monthIndex, index + 1)),
  ]
  const weekCount = Math.ceil(cells.length / 7)

  return Array.from({ length: weekCount }, (_, weekIndex) =>
    Array.from({ length: 7 }, (_, dayIndex) => cells[weekIndex * 7 + dayIndex] ?? null),
  )
}

/** 출석 달력의 표시 월과 날짜별 출석 여부를 관리합니다. 현재 달 이후로는 이동할 수 없습니다. */
export const useAttendanceCalendar = () => {
  const today = new Date()
  const currentMonth = new Date(today.getFullYear(), today.getMonth(), 1)
  const [visibleMonth, setVisibleMonth] = useState(currentMonth)
  const year = visibleMonth.getFullYear()
  const monthIndex = visibleMonth.getMonth()
  const query = useMonthlyAttendance(year, monthIndex + 1)

  const attendedDates = query.data
  const weeks = getCalendarWeeks(year, monthIndex).map((week) =>
    week.map((date): CalendarDay | null => {
      if (!date) {
        return null
      }

      const dateKey = toDateKey(date)

      return { dateKey, date: date.getDate(), isAttended: attendedDates?.has(dateKey) ?? false }
    }),
  )

  return {
    isPending: query.isPending,
    isError: query.isError,
    isFetching: query.isFetching,
    refetch: query.refetch,
    title: year === today.getFullYear() ? `${monthIndex + 1}월` : `${year}년 ${monthIndex + 1}월`,
    weeks,
    canGoNext: visibleMonth < currentMonth,
    goPreviousMonth: () => setVisibleMonth(new Date(year, monthIndex - 1, 1)),
    goNextMonth: () => setVisibleMonth(new Date(year, monthIndex + 1, 1)),
  }
}
