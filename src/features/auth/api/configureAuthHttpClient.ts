import { getAccessToken } from '../model/authSession'
import { getValidAccessToken } from '../model/getValidAccessToken'
import { aiHttpClient, httpClient } from '@shared/api'
import { routePaths } from '@shared/config'
import type { AxiosError, InternalAxiosRequestConfig } from 'axios'

type RetryableRequestConfig = InternalAxiosRequestConfig & { _retry?: boolean }

const interceptorIds = new Map<typeof httpClient, { request: number; response: number }>()

const PUBLIC_AUTH_PATHS = [
  '/api/v1/auth/login',
  '/api/v1/auth/signup',
  '/api/v1/auth/oauth/token',
  '/api/v1/auth/find-id',
  '/api/v1/auth/email/send',
  '/api/v1/auth/email/check',
  '/api/v1/auth/check/username',
  '/api/v1/auth/password',
]

const isPublicAuthRequest = (url?: string) =>
  PUBLIC_AUTH_PATHS.some((path) => url?.startsWith(path))

/** 외부 음원 주소 등에는 BADA 인증 토큰을 첨부하지 않습니다. */
const isSameApiOrigin = (config: InternalAxiosRequestConfig, baseURL?: string) => {
  try {
    return new URL(config.url ?? '', config.baseURL).origin === new URL(baseURL ?? '').origin
  } catch {
    return false
  }
}

const redirectToLogin = () => {
  window.location.assign(routePaths.login)
}

/** 공통 HTTP 클라이언트에 인증 헤더와 토큰 갱신 동작을 연결합니다. */
export const configureAuthHttpClient = (onAuthenticationFailure = redirectToLogin) => {
  for (const client of [httpClient, aiHttpClient]) {
    const previous = interceptorIds.get(client)
    if (previous) {
      client.interceptors.request.eject(previous.request)
      client.interceptors.response.eject(previous.response)
    }
    const request = client.interceptors.request.use((config) => {
      const accessToken = getAccessToken()
      if (
        accessToken &&
        isSameApiOrigin(config, client.defaults.baseURL) &&
        !(client === httpClient && isPublicAuthRequest(config.url))
      ) {
        config.headers.set('Authorization', `Bearer ${accessToken}`)
      }

      return config
    })

    const response = client.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        const request = error.config as RetryableRequestConfig | undefined
        const hasAuthorization = request?.headers.has('Authorization')

        if (error.response?.status !== 401 || !request || request._retry || !hasAuthorization) {
          return Promise.reject(error)
        }

        request._retry = true

        try {
          const accessToken = await getValidAccessToken(true)
          request.headers.set('Authorization', `Bearer ${accessToken}`)
          return client(request)
        } catch (refreshError) {
          onAuthenticationFailure()
          return Promise.reject(refreshError)
        }
      },
    )
    interceptorIds.set(client, { request, response })
  }
}
