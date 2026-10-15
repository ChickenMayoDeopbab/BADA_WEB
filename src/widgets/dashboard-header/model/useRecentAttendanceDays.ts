import { useMonthlyAttendance } from '@entities/attendance'
import { WEEKDAY_LABELS, addDays, toDateKey } from '@shared/lib'

const RECENT_DAY_COUNT = 7

export interface RecentAttendanceDay {
  dateKey: string
  label: string
  isToday: boolean
  isAttended: boolean
  isPending: boolean
  isError: boolean
}

/** 오늘을 포함한 최근 7일의 출석 여부를 조회합니다. 7일이 두 달에 걸치면 두 달을 함께 조회합니다. */
export const useRecentAttendanceDays = (): RecentAttendanceDay[] => {
  const today = new Date()
  const firstDay = addDays(today, -(RECENT_DAY_COUNT - 1))
  const {
    data: firstMonthDates,
    isPending: isFirstPending,
    isError: isFirstError,
  } = useMonthlyAttendance(firstDay.getFullYear(), firstDay.getMonth() + 1)
  const {
    data: currentMonthDates,
    isPending: isCurrentPending,
    isError: isCurrentError,
  } = useMonthlyAttendance(today.getFullYear(), today.getMonth() + 1)

  return Array.from({ length: RECENT_DAY_COUNT }, (_, index) => {
    const date = addDays(firstDay, index)
    const dateKey = toDateKey(date)
    const isToday = index === RECENT_DAY_COUNT - 1

    return {
      dateKey,
      label: isToday ? '오늘' : WEEKDAY_LABELS[date.getDay()],
      isToday,
      isPending: isFirstPending || isCurrentPending,
      isError: isFirstError || isCurrentError,
      isAttended: Boolean(firstMonthDates?.has(dateKey) || currentMonthDates?.has(dateKey)),
    }
  })
}
