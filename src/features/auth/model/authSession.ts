import type { AuthTokens } from './types'

const ACCESS_TOKEN_KEY = 'bada.accessToken'
const REFRESH_TOKEN_KEY = 'bada.refreshToken'

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

/** 로그인 후 전달받은 액세스 토큰을 저장합니다. */
export const setAccessToken = (accessToken: string, persist = true) => {
  window.localStorage.removeItem(ACCESS_TOKEN_KEY)
  window.sessionStorage.removeItem(ACCESS_TOKEN_KEY)
  getTargetStorage(persist).setItem(ACCESS_TOKEN_KEY, accessToken)
}

/** 로그인 후 전달받은 토큰을 저장합니다. persist가 false면 브라우저를 닫을 때 제거됩니다. */
export const setAuthTokens = ({ accessToken, refreshToken }: AuthTokens, persist: boolean) => {
  clearAuthSession()

  const storage = getTargetStorage(persist)
  storage.setItem(ACCESS_TOKEN_KEY, accessToken)
  storage.setItem(REFRESH_TOKEN_KEY, refreshToken)
}

/** 현재 브라우저에 인증 세션이 존재하는지 확인합니다. */
export const hasAuthSession = () => Boolean(getAccessToken())

/** 로그아웃 시 저장된 인증 세션을 제거합니다. */
export const clearAuthSession = () => {
  getStorages().forEach((storage) => {
    storage.removeItem(ACCESS_TOKEN_KEY)
    storage.removeItem(REFRESH_TOKEN_KEY)
  })
}
