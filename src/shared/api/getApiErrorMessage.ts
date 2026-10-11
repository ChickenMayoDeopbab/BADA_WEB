import type { ApiResponse } from '@shared/types'
import { isAxiosError } from 'axios'

/** API 오류 응답에서 사용자에게 보여줄 메시지를 추출합니다. */
export const getApiErrorMessage = (error: unknown, fallback: string) => {
  if (!isAxiosError<Partial<ApiResponse<unknown>>>(error)) {
    return fallback
  }

  return error.response?.data?.error?.message || error.response?.data?.message || fallback
}
