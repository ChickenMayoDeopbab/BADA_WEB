import { getMonthlyAttendances } from '../api/attendanceApi'
import { useQuery } from '@tanstack/react-query'

export const attendanceKeys = {
  all: ['attendance'] as const,
  monthly: (year: number, month: number) => ['attendance', year, month] as const,
}

/** 지정한 연월(month는 1부터 시작)의 출석 날짜(YYYY-MM-DD) 집합을 조회합니다. */
export const useMonthlyAttendance = (year: number, month: number) =>
  useQuery({
    queryKey: attendanceKeys.monthly(year, month),
    queryFn: () => getMonthlyAttendances(year, month),
    select: (attendances) => new Set(attendances.map(({ date }) => date)),
  })
