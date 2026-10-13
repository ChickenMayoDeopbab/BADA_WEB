import type { Attendance } from '../model/types'
import { httpClient } from '@shared/api'
import type { ApiResponse } from '@shared/types'

/** 지정한 연월의 출석 날짜 목록을 조회합니다. */
export const getMonthlyAttendances = async (year: number, month: number) => {
  const { data } = await httpClient.get<ApiResponse<Attendance[]>>('/api/v1/attendance', {
    params: { year, month },
  })

  return data.data
}
