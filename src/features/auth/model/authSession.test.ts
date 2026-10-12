import {
  clearAuthSession,
  getAccessToken,
  getRefreshToken,
  hasAuthSession,
  setAccessToken,
  setAuthTokens,
} from './authSession'
import { afterEach, describe, expect, it } from 'vitest'

describe('authSession', () => {
  afterEach(() => {
    clearAuthSession()
  })

  it('stores and restores an access token', () => {
    setAccessToken('test-access-token')

    expect(getAccessToken()).toBe('test-access-token')
    expect(hasAuthSession()).toBe(true)
  })

  it('clears the stored session', () => {
    window.localStorage.setItem('bada.accessToken', 'local-access')
    window.localStorage.setItem('bada.refreshToken', 'local-refresh')
    window.sessionStorage.setItem('bada.accessToken', 'session-access')
    window.sessionStorage.setItem('bada.refreshToken', 'session-refresh')

    clearAuthSession()

    expect(window.localStorage.getItem('bada.accessToken')).toBeNull()
    expect(window.localStorage.getItem('bada.refreshToken')).toBeNull()
    expect(window.sessionStorage.getItem('bada.accessToken')).toBeNull()
    expect(window.sessionStorage.getItem('bada.refreshToken')).toBeNull()
    expect(hasAuthSession()).toBe(false)
  })

  it('stores tokens in localStorage when the session should persist', () => {
    setAuthTokens({ accessToken: 'access', refreshToken: 'refresh' }, true)

    expect(window.localStorage.getItem('bada.accessToken')).toBe('access')
    expect(window.sessionStorage.getItem('bada.accessToken')).toBeNull()
    expect(getRefreshToken()).toBe('refresh')
  })

  it('stores tokens in sessionStorage when the session should not persist', () => {
    setAuthTokens({ accessToken: 'access', refreshToken: 'refresh' }, false)

    expect(window.localStorage.getItem('bada.accessToken')).toBeNull()
    expect(getAccessToken()).toBe('access')
    expect(getRefreshToken()).toBe('refresh')
  })

  it('replaces a previous session stored in the other storage', () => {
    setAuthTokens({ accessToken: 'old', refreshToken: 'old-refresh' }, true)
    setAuthTokens({ accessToken: 'new', refreshToken: 'new-refresh' }, false)

    expect(window.localStorage.getItem('bada.accessToken')).toBeNull()
    expect(getAccessToken()).toBe('new')
  })
})
