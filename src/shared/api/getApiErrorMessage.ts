import type { ApiResponse } from '@shared/types'
import { isAxiosError } from 'axios'

/** API 오류 응답에서 사용자에게 보여줄 메시지를 추출합니다. */
export const getApiErrorMessage = (error: unknown, fallback: string) => {
  if (
    !isAxiosError<Partial<ApiResponse<unknown>> & { detail?: string | Array<{ msg?: string }> }>(
      error,
    )
  ) {
    return fallback
  }

  const data = error.response?.data
  const detail = typeof data?.detail === 'string' ? data.detail : ''
  return data?.error?.message || data?.message || detail || fallback
}
