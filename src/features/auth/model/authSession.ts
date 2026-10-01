const ACCESS_TOKEN_KEY = 'bada.accessToken'

/** 저장된 액세스 토큰을 반환합니다. */
export const getAccessToken = () => window.localStorage.getItem(ACCESS_TOKEN_KEY)

/** 로그인 후 전달받은 액세스 토큰을 저장합니다. */
export const setAccessToken = (accessToken: string) => {
  window.localStorage.setItem(ACCESS_TOKEN_KEY, accessToken)
}

/** 현재 브라우저에 인증 세션이 존재하는지 확인합니다. */
export const hasAuthSession = () => Boolean(getAccessToken())

/** 로그아웃 시 저장된 인증 세션을 제거합니다. */
export const clearAuthSession = () => {
  window.localStorage.removeItem(ACCESS_TOKEN_KEY)
}
