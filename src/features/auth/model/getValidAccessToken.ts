import { refreshAuthTokens } from '../api/authApi'
import {
  clearAuthSession,
  getAccessToken,
  getRefreshToken,
  getTokenUserId,
  isTokenExpired,
  replaceAuthTokens,
} from './authSession'

let refreshPromise: Promise<string> | null = null

/** HTTP와 WebSocket이 하나의 갱신 요청을 공유하며 유효한 토큰을 얻습니다. */
export const getValidAccessToken = async (shouldRefresh = false): Promise<string> => {
  if (refreshPromise) return refreshPromise
  const accessToken = getAccessToken()
  if (!shouldRefresh && accessToken && !isTokenExpired(accessToken)) return accessToken
  const refreshToken = getRefreshToken()
  const userId = refreshToken ? getTokenUserId(refreshToken) : null
  if (!refreshToken || !userId || isTokenExpired(refreshToken)) {
    clearAuthSession()
    throw new Error('AUTH_REQUIRED')
  }
  refreshPromise = refreshAuthTokens({ refreshToken, userId })
    .then((tokens) => {
      if (getRefreshToken() !== refreshToken) throw new Error('AUTH_REQUIRED')
      replaceAuthTokens(tokens)
      return tokens.accessToken
    })
    .catch((error: unknown) => {
      if (getRefreshToken() === refreshToken) clearAuthSession()
      throw error
    })
    .finally(() => {
      refreshPromise = null
    })
  return refreshPromise
}
