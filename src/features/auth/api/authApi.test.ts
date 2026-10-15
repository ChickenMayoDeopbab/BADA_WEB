import { getOAuthLoginUrl } from './authApi'
import { env } from '@shared/config'
import { describe, expect, it } from 'vitest'

describe('getOAuthLoginUrl', () => {
  it.each(['google', 'naver', 'apple'] as const)(
    '%s 인증 URL에 웹 콜백 주소를 쿼리 매개변수 하나로 전달한다',
    (provider) => {
      const redirectUri = 'https://chickenmayo.kr/oauth/callback'

      const loginUrl = new URL(getOAuthLoginUrl(provider, redirectUri))

      expect(loginUrl.origin).toBe(new URL(env.apiBaseUrl).origin)
      expect(loginUrl.pathname).toBe(`/api/v1/auth/${provider}`)
      expect([...loginUrl.searchParams]).toEqual([['redirectUri', redirectUri]])
    },
  )
})
