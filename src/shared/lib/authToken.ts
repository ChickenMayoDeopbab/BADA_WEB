import { authStorageKeys } from '@shared/config'

const decodeTokenSubject = (token: string) => {
  try {
    const payload = token.split('.')[1]
    if (!payload) return null

    const normalizedPayload = payload.replace(/-/g, '+').replace(/_/g, '/')
    const paddedPayload = normalizedPayload.padEnd(Math.ceil(normalizedPayload.length / 4) * 4, '=')
    return (JSON.parse(window.atob(paddedPayload)) as { sub?: string }).sub ?? null
  } catch {
    return null
  }
}

/** 현재 인증 토큰의 사용자 ID를 반환합니다. */
export const getCurrentUserId = () => {
  const token =
    window.localStorage.getItem(authStorageKeys.accessToken) ??
    window.sessionStorage.getItem(authStorageKeys.accessToken)
  const userId = token ? Number(decodeTokenSubject(token)) : NaN

  return Number.isSafeInteger(userId) && userId > 0 ? userId : null
}
