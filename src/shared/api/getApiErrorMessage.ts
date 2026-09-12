import type { ApiResponse } from '@shared/types'
import { isAxiosError } from 'axios'

/** API 오류 응답에서 사용자에게 보여줄 메시지를 추출합니다. */
export const getApiErrorMessage = (error: unknown, fallback: string) => {
  if (!isAxiosError<Partial<ApiResponse<unknown>> & { detail?: unknown }>(error)) {
    return fallback
  }

  const data = error.response?.data
  return data?.error?.message || data?.message || (typeof data?.detail === 'string' ? data.detail : fallback)
}
