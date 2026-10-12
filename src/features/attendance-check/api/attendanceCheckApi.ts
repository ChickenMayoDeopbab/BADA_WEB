import { httpClient } from '@shared/api'
import type { ApiResponse } from '@shared/types'

/** 오늘 출석을 기록합니다. */
export const checkTodayAttendance = async () => {
  const { data } = await httpClient.post<ApiResponse<boolean>>('/api/v1/attendance')

  return data.data
}
