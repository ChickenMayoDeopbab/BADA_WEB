import { exchangeOAuthCode, getOAuthLoginUrl } from '../api/authApi'
import { setAuthTokens } from './authSession'
import type { OAuthProvider } from './types'
import { getApiErrorMessage } from '@shared/api'
import { routePaths } from '@shared/config'
import { useEffect, useRef, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'

const DEFAULT_OAUTH_ERROR_MESSAGE = '소셜 로그인에 실패했어요. 다시 시도해 주세요.'

/**
 * 서버의 소셜 로그인 화면으로 이동합니다.
 * 서버가 허용하지 않은 redirectUri는 Auth-008로 거절되므로 BADA 앱과 같이 서버 기본 리다이렉트를 사용합니다.
 */
export const startOAuthLogin = (provider: OAuthProvider) => {
  window.location.assign(getOAuthLoginUrl(provider))
}

export type OAuthCallbackStatus = 'loading' | 'error'

// 소셜 로그인 콜백의 code를 토큰으로 교환하고 다음 화면으로 이동합니다.
export const useOAuthCallback = () => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [status, setStatus] = useState<OAuthCallbackStatus>('loading')
  const [errorMessage, setErrorMessage] = useState(DEFAULT_OAUTH_ERROR_MESSAGE)
  const hasStartedRef = useRef(false)

  const code = searchParams.get('code')?.trim()
  const oauthError = searchParams.get('error')?.trim()
  const oauthErrorMessage =
    searchParams.get('error_description')?.trim() || searchParams.get('message')?.trim()
  // 제공자가 오류를 돌려주었거나 code가 없으면 교환을 시도하지 않습니다.
  const callbackErrorMessage =
    oauthError || !code
      ? oauthErrorMessage || '소셜 로그인이 취소되었거나 처리 중 문제가 발생했어요.'
      : null

  useEffect(() => {
    // StrictMode의 effect 재실행으로 같은 code를 두 번 교환하지 않도록 막습니다.
    if (!code || callbackErrorMessage || hasStartedRef.current) return
    hasStartedRef.current = true

    const completeOAuthLogin = async () => {
      try {
        const { accessToken, refreshToken, isNewUser } = await exchangeOAuthCode(code)

        if (!accessToken || !refreshToken) {
          throw new Error('OAuth token response is invalid')
        }

        setAuthTokens({ accessToken, refreshToken }, true)
        navigate(isNewUser ? routePaths.welcome : routePaths.dashboard, { replace: true })
      } catch (error) {
        setErrorMessage(getApiErrorMessage(error, DEFAULT_OAUTH_ERROR_MESSAGE))
        setStatus('error')
      }
    }

    void completeOAuthLogin()
  }, [callbackErrorMessage, code, navigate])

  return {
    status: callbackErrorMessage ? 'error' : status,
    errorMessage: callbackErrorMessage ?? errorMessage,
    goToLogin: () => navigate(routePaths.login, { replace: true }),
  }
}
