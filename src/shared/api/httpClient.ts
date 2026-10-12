import { env, routePaths } from '@shared/config'
import axios from 'axios'

const ACCESS_TOKEN_KEY = 'bada.accessToken'
const REFRESH_TOKEN_KEY = 'bada.refreshToken'

const defaultHttpConfig = {
  timeout: 10_000,
  headers: {
    'Content-Type': 'application/json',
  },
} as const

/** Spring API 요청에 사용하는 공통 HTTP 클라이언트입니다. */
export const httpClient = axios.create({
  ...defaultHttpConfig,
  baseURL: env.apiBaseUrl,
})

// 인증이 필요한 Spring API 요청에 현재 로그인 세션의 액세스 토큰을 첨부합니다.
httpClient.interceptors.request.use((config) => {
  const accessToken =
    window.localStorage.getItem(ACCESS_TOKEN_KEY) ?? window.sessionStorage.getItem(ACCESS_TOKEN_KEY)

  if (accessToken) {
    config.headers.set('Authorization', `Bearer ${accessToken}`)
  }

  return config
})

// 만료되었거나 유효하지 않은 세션은 제거하고 로그인 화면에서 다시 인증하게 합니다.
httpClient.interceptors.response.use(
  (response) => response,
  (error: unknown) => {
    if (
      axios.isAxiosError(error) &&
      error.response?.status === 401 &&
      !error.config?.url?.startsWith('/api/v1/auth')
    ) {
      const authStorages = [window.localStorage, window.sessionStorage]

      authStorages.forEach((storage) => {
        storage.removeItem(ACCESS_TOKEN_KEY)
        storage.removeItem(REFRESH_TOKEN_KEY)
      })

      if (window.location.pathname !== routePaths.login) {
        window.location.assign(routePaths.login)
      }
    }

    return Promise.reject(error)
  },
)

/** AI API 요청에 사용하는 공통 HTTP 클라이언트입니다. */
export const aiHttpClient = axios.create({
  ...defaultHttpConfig,
  baseURL: env.aiApiBaseUrl,
})
