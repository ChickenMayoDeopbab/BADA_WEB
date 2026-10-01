type UrlEnvironmentKey = 'VITE_API_BASE_URL' | 'VITE_AI_API_BASE_URL'

// 필수 URL 환경변수의 존재 여부와 형식을 검증합니다.
const readUrlEnvironment = (key: UrlEnvironmentKey, value: string | undefined) => {
  if (!value) {
    throw new Error(`[환경변수 오류] ${key}가 설정되지 않았습니다.`)
  }

  try {
    return new URL(value).toString().replace(/\/$/, '')
  } catch {
    throw new Error(`[환경변수 오류] ${key}는 유효한 URL이어야 합니다.`)
  }
}

// 문자열 환경변수를 boolean 값으로 변환합니다.
const readBooleanEnvironment = (value: string | undefined, defaultValue: boolean) => {
  if (value === undefined) {
    return defaultValue
  }

  if (value === 'true') {
    return true
  }

  if (value === 'false') {
    return false
  }

  throw new Error('[환경변수 오류] VITE_AUTH_GUARD_ENABLED는 true 또는 false여야 합니다.')
}

export const env = {
  apiBaseUrl: readUrlEnvironment('VITE_API_BASE_URL', import.meta.env.VITE_API_BASE_URL),
  aiApiBaseUrl: readUrlEnvironment('VITE_AI_API_BASE_URL', import.meta.env.VITE_AI_API_BASE_URL),
  isAuthGuardEnabled: readBooleanEnvironment(import.meta.env.VITE_AUTH_GUARD_ENABLED, false),
} as const
