import type { AuthTokens } from './types'
import { authStorageKeys } from '@shared/config'

const { accessToken: ACCESS_TOKEN_KEY, refreshToken: REFRESH_TOKEN_KEY } = authStorageKeys
const AUTH_SESSION_EVENT = 'bada:auth-session-changed'

const getStorages = () => [window.localStorage, window.sessionStorage]

// 로그인 상태 유지 여부에 따라 토큰을 보관할 저장소를 고릅니다.
const getTargetStorage = (persist: boolean) =>
  persist ? window.localStorage : window.sessionStorage

// 여러 저장소 중 먼저 발견되는 값을 반환합니다.
const readToken = (key: string) =>
  getStorages()
    .map((storage) => storage.getItem(key))
    .find((value) => value !== null) ?? null

/** 저장된 액세스 토큰을 반환합니다. */
export const getAccessToken = () => readToken(ACCESS_TOKEN_KEY)

/** 저장된 리프레시 토큰을 반환합니다. */
export const getRefreshToken = () => readToken(REFRESH_TOKEN_KEY)

const decodeTokenPayload = (token: string) => {
  try {
    const payload = token.split('.')[1]
    if (!payload) return null

    const normalizedPayload = payload.replace(/-/g, '+').replace(/_/g, '/')
    const paddedPayload = normalizedPayload.padEnd(Math.ceil(normalizedPayload.length / 4) * 4, '=')

    return JSON.parse(window.atob(paddedPayload)) as { exp?: number; sub?: string }
  } catch {
    return null
  }
}

/** JWT subject에서 토큰 갱신에 필요한 사용자 ID를 반환합니다. */
export const getTokenUserId = (token: string) => {
  const subject = decodeTokenPayload(token)?.sub
  if (!subject) return null

  const userId = Number(subject)
  return Number.isSafeInteger(userId) && userId > 0 ? userId : null
}

/** 만료 시간을 확인할 수 있는 JWT가 만료되었는지 검사합니다. */
export const isTokenExpired = (token: string) => {
  const expiration = decodeTokenPayload(token)?.exp
  return expiration !== undefined && expiration * 1000 <= Date.now()
}

/** 로그인 후 전달받은 액세스 토큰을 저장합니다. */
export const setAccessToken = (accessToken: string, persist = true) => {
  window.localStorage.removeItem(ACCESS_TOKEN_KEY)
  window.sessionStorage.removeItem(ACCESS_TOKEN_KEY)
  getTargetStorage(persist).setItem(ACCESS_TOKEN_KEY, accessToken)
  window.dispatchEvent(new Event(AUTH_SESSION_EVENT))
}

/** 로그인 후 전달받은 토큰을 저장합니다. persist가 false면 브라우저를 닫을 때 제거됩니다. */
export const setAuthTokens = ({ accessToken, refreshToken }: AuthTokens, persist: boolean) => {
  clearStoredTokens()

  const storage = getTargetStorage(persist)
  storage.setItem(ACCESS_TOKEN_KEY, accessToken)
  storage.setItem(REFRESH_TOKEN_KEY, refreshToken)
  window.dispatchEvent(new Event(AUTH_SESSION_EVENT))
}

/** 갱신된 토큰을 기존 로그인 세션과 동일한 저장소에 교체합니다. */
export const replaceAuthTokens = (tokens: AuthTokens) => {
  const persist = window.localStorage.getItem(REFRESH_TOKEN_KEY) !== null
  setAuthTokens(tokens, persist)
}

/** 현재 브라우저에 인증 세션이 존재하는지 확인합니다. */
export const hasAuthSession = () => {
  const accessToken = getAccessToken()
  if (!accessToken) return false
  if (!isTokenExpired(accessToken)) return true

  const refreshToken = getRefreshToken()
  return Boolean(refreshToken && !isTokenExpired(refreshToken))
}

/** 저장소 교체 중에는 중간 로그아웃 상태를 알리지 않고 토큰만 정리합니다. */
const clearStoredTokens = () => {
  getStorages().forEach((storage) => {
    storage.removeItem(ACCESS_TOKEN_KEY)
    storage.removeItem(REFRESH_TOKEN_KEY)
  })
}

/** 로그아웃 시 인증 세션을 제거하고 현재 화면의 인증 검사에 알립니다. */
export const clearAuthSession = () => {
  clearStoredTokens()
  window.dispatchEvent(new Event(AUTH_SESSION_EVENT))
}

/** 세션 변경·다른 탭 로그아웃·만료 시점을 구독합니다. */
export const subscribeAuthSession = (onChange: () => void) => {
  let expirationTimer: ReturnType<typeof setTimeout> | undefined

  /** 화면 복귀와 토큰 변경 시 세션을 재검사하고 만료 타이머를 갱신합니다. */
  const handleChange = () => {
    clearTimeout(expirationTimer)
    const accessToken = getAccessToken()
    if (accessToken) {
      const tokens = [accessToken, getRefreshToken()].filter((value): value is string =>
        Boolean(value),
      )
      const expirations = tokens.map((token) => decodeTokenPayload(token)?.exp)
      if (expirations.every((value): value is number => typeof value === 'number')) {
        const remaining = Math.max(...expirations) * 1000 - Date.now()
        if (remaining > 0)
          expirationTimer = setTimeout(handleChange, Math.min(remaining, 2_147_483_647))
      }
    }
    onChange()
  }

  /** 인증 키 또는 저장소 전체가 변경된 경우에만 반영합니다. */
  const handleStorage = (event: StorageEvent) => {
    if (event.key === null || event.key === ACCESS_TOKEN_KEY || event.key === REFRESH_TOKEN_KEY)
      handleChange()
  }

  window.addEventListener(AUTH_SESSION_EVENT, handleChange)
  window.addEventListener('storage', handleStorage)
  window.addEventListener('focus', handleChange)
  window.addEventListener('pageshow', handleChange)
  handleChange()

  return () => {
    clearTimeout(expirationTimer)
    window.removeEventListener(AUTH_SESSION_EVENT, handleChange)
    window.removeEventListener('storage', handleStorage)
    window.removeEventListener('focus', handleChange)
    window.removeEventListener('pageshow', handleChange)
  }
}
