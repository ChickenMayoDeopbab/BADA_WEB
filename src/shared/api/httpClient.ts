import { authStorageKeys, env } from '@shared/config'
import axios from 'axios'

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

/** 인터셉터의 영향을 받지 않아야 하는 인증 갱신 요청에 사용합니다. */
export const plainHttpClient = axios.create({
  ...defaultHttpConfig,
  baseURL: env.apiBaseUrl,
})
/** AI API 요청에 사용하는 공통 HTTP 클라이언트입니다. */
export const aiHttpClient = axios.create({
  ...defaultHttpConfig,
  baseURL: env.aiApiBaseUrl,
})

aiHttpClient.interceptors.request.use((config) => {
  const accessToken =
    window.localStorage.getItem(authStorageKeys.accessToken) ??
    window.sessionStorage.getItem(authStorageKeys.accessToken)

  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`
  }

  return config
})
