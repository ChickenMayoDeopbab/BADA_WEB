import { isAxiosError } from 'axios'

/** 사용자에게 보여줄 문자열만 읽고 검증 오류의 입력값이나 객체는 노출하지 않습니다. */
const readMessage = (value: unknown) => (typeof value === 'string' ? value.trim() : '')

/** Spring 오류와 FastAPI 문자열·검증 오류 목록에서 사용자 안내 메시지를 추출합니다. */
export const getApiErrorMessage = (error: unknown, fallback: string) => {
  if (!isAxiosError<{ error?: { message?: unknown }; message?: unknown; detail?: unknown }>(error))
    return fallback
  const data = error.response?.data
  const detail = Array.isArray(data?.detail)
    ? [
        ...new Set(
          data.detail
            .map((item: unknown) =>
              item && typeof item === 'object' && 'msg' in item ? readMessage(item.msg) : '',
            )
            .filter(Boolean),
        ),
      ].join('\n')
    : readMessage(data?.detail)
  return readMessage(data?.error?.message) || readMessage(data?.message) || detail || fallback
}
