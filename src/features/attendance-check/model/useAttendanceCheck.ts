import { checkTodayAttendance } from '../api/attendanceCheckApi'
import { attendanceKeys, useMonthlyAttendance } from '@entities/attendance'
import { toDateKey } from '@shared/lib'
import { useMutation, useQueryClient } from '@tanstack/react-query'

/** 오늘 출석 여부를 확인하고 출석 기록 요청을 처리합니다. */
export const useAttendanceCheck = () => {
  const queryClient = useQueryClient()
  const today = new Date()
  const { data: attendedDates, isPending: isAttendanceLoading } = useMonthlyAttendance(
    today.getFullYear(),
    today.getMonth() + 1,
  )

  const { mutate, isPending: isChecking } = useMutation({
    mutationFn: checkTodayAttendance,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: attendanceKeys.all }),
  })

  const isCheckedToday = attendedDates?.has(toDateKey(today)) ?? false

  return {
    isCheckedToday,
    isDisabled: isCheckedToday || isAttendanceLoading || isChecking,
    checkAttendance: () => mutate(),
  }
}
