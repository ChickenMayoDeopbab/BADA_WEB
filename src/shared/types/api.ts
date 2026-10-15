/** 서버가 실패 응답에 담아 보내는 오류 정보입니다. */
export type ApiErrorResponse = {
  code: string
  message: string
  details?: Record<string, string>
  timestamp: string
}

/** Spring 서버의 공통 응답 형식입니다. */
export type ApiResponse<T> = {
  status: number
  message: string
  data: T
  error?: ApiErrorResponse | null
}
