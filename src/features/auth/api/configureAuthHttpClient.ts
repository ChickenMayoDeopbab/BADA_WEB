import { refreshAuthTokens } from './authApi'
import {
  clearAuthSession,
  getAccessToken,
  getRefreshToken,
  getTokenUserId,
  replaceAuthTokens,
} from '../model/authSession'
import { aiHttpClient, httpClient } from '@shared/api'
import { routePaths } from '@shared/config'
import type { AxiosError, InternalAxiosRequestConfig } from 'axios'

type RetryableRequestConfig = InternalAxiosRequestConfig & { _retry?: boolean }

let requestInterceptorId: number | null = null
let responseInterceptorId: number | null = null
let aiRequestInterceptorId: number | null = null
let aiResponseInterceptorId: number | null = null
let refreshPromise: Promise<string> | null = null

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

const redirectToLogin = () => {
  window.location.assign(routePaths.login)
}

/** 공통 HTTP 클라이언트에 인증 헤더와 토큰 갱신 동작을 연결합니다. */
export const configureAuthHttpClient = (onAuthenticationFailure = redirectToLogin) => {
  if (requestInterceptorId !== null) {
    httpClient.interceptors.request.eject(requestInterceptorId)
  }
  if (responseInterceptorId !== null) {
    httpClient.interceptors.response.eject(responseInterceptorId)
  }
  if (aiRequestInterceptorId !== null) {
    aiHttpClient.interceptors.request.eject(aiRequestInterceptorId)
  }
  if (aiResponseInterceptorId !== null) {
    aiHttpClient.interceptors.response.eject(aiResponseInterceptorId)
  }

  requestInterceptorId = httpClient.interceptors.request.use((config) => {
    const accessToken = getAccessToken()
    if (accessToken && !isPublicAuthRequest(config.url)) {
      config.headers.set('Authorization', `Bearer ${accessToken}`)
    }

    return config
  })

  aiRequestInterceptorId = aiHttpClient.interceptors.request.use((config) => {
    const accessToken = getAccessToken()
    if (accessToken) {
      config.headers.set('Authorization', `Bearer ${accessToken}`)
    }

    return config
  })

  responseInterceptorId = httpClient.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
      const request = error.config as RetryableRequestConfig | undefined
      const hasAuthorization = request?.headers.has('Authorization')

      if (error.response?.status !== 401 || !request || request._retry || !hasAuthorization) {
        return Promise.reject(error)
      }

      const refreshToken = getRefreshToken()
      const userId = refreshToken ? getTokenUserId(refreshToken) : null
      if (!refreshToken || !userId) {
        clearAuthSession()
        onAuthenticationFailure()
        return Promise.reject(error)
      }

      request._retry = true

      try {
        if (!refreshPromise) {
          refreshPromise = refreshAuthTokens({ refreshToken, userId })
            .then((tokens) => {
              replaceAuthTokens(tokens)
              return tokens.accessToken
            })
            .catch((refreshError: unknown) => {
              clearAuthSession()
              onAuthenticationFailure()
              throw refreshError
            })
            .finally(() => {
              refreshPromise = null
            })
        }

        const accessToken = await refreshPromise
        request.headers.set('Authorization', `Bearer ${accessToken}`)
        return httpClient(request)
      } catch (refreshError) {
        return Promise.reject(refreshError)
      }
    },
  )

  aiResponseInterceptorId = aiHttpClient.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
      const request = error.config as RetryableRequestConfig | undefined
      const hasAuthorization = request?.headers.has('Authorization')

      if (error.response?.status !== 401 || !request || request._retry || !hasAuthorization) {
        return Promise.reject(error)
      }

      const refreshToken = getRefreshToken()
      const userId = refreshToken ? getTokenUserId(refreshToken) : null
      if (!refreshToken || !userId) {
        clearAuthSession()
        onAuthenticationFailure()
        return Promise.reject(error)
      }

      request._retry = true

      try {
        if (!refreshPromise) {
          refreshPromise = refreshAuthTokens({ refreshToken, userId })
            .then((tokens) => {
              replaceAuthTokens(tokens)
              return tokens.accessToken
            })
            .catch((refreshError: unknown) => {
              clearAuthSession()
              onAuthenticationFailure()
              throw refreshError
            })
            .finally(() => {
              refreshPromise = null
            })
        }

        const accessToken = await refreshPromise
        request.headers.set('Authorization', `Bearer ${accessToken}`)
        return aiHttpClient(request)
      } catch (refreshError) {
        return Promise.reject(refreshError)
      }
    },
  )
}
