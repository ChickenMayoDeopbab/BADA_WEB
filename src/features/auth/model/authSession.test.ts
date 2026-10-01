import { clearAuthSession, getAccessToken, hasAuthSession, setAccessToken } from './authSession'
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
    setAccessToken('test-access-token')
    clearAuthSession()

    expect(getAccessToken()).toBeNull()
    expect(hasAuthSession()).toBe(false)
  })
})
