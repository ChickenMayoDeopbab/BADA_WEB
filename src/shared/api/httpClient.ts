import { env } from '@shared/config'
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

/** AI API 요청에 사용하는 공통 HTTP 클라이언트입니다. */
export const aiHttpClient = axios.create({
  ...defaultHttpConfig,
  baseURL: env.aiApiBaseUrl,
})
