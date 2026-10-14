import { getCurrentUserId } from './authToken'
import { authStorageKeys } from '@shared/config'
import { afterEach, describe, expect, it } from 'vitest'

const createToken = (subject: string) => {
  const payload = window.btoa(JSON.stringify({ sub: subject }))
  return `header.${payload}.signature`
}

describe('getCurrentUserId', () => {
  afterEach(() => {
    window.localStorage.clear()
    window.sessionStorage.clear()
  })

  it('reads the user id from the stored access token', () => {
    window.sessionStorage.setItem(authStorageKeys.accessToken, createToken('43'))

    expect(getCurrentUserId()).toBe(43)
  })

  it('returns null when the token subject is invalid', () => {
    window.localStorage.setItem(authStorageKeys.accessToken, createToken('user'))

    expect(getCurrentUserId()).toBeNull()
  })
})
