import { isAxiosError } from 'axios'

/** 네트워크 오류와 5xx만 다시 시도합니다. 404(측정 안 함·기능 꺼짐)와 403은 다시 물어도 같습니다. */
const MAX_RETRIES = 2

export const shouldRetryBiosignal = (failureCount: number, error: unknown) =>
  failureCount < MAX_RETRIES &&
  isAxiosError(error) &&
  (error.response === undefined || error.response.status >= 500)
