import { refreshAuthTokens } from './authApi'
import { configureAuthHttpClient } from './configureAuthHttpClient'
import {
  clearAuthSession,
  getAccessToken,
  getRefreshToken,
  setAuthTokens,
} from '../model/authSession'
import { aiHttpClient, httpClient } from '@shared/api'
import type { AxiosAdapter, AxiosResponse, InternalAxiosRequestConfig } from 'axios'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('./authApi', () => ({
  refreshAuthTokens: vi.fn(),
}))

const mockedRefreshAuthTokens = vi.mocked(refreshAuthTokens)
const originalAdapter = httpClient.defaults.adapter
const originalAiAdapter = aiHttpClient.defaults.adapter

const token = (payload: Record<string, unknown>) =>
  `header.${window.btoa(JSON.stringify(payload))}.signature`

const response = (config: InternalAxiosRequestConfig, data: unknown): AxiosResponse => ({
  data,
  status: 200,
  statusText: 'OK',
  headers: {},
  config,
})

describe('configureAuthHttpClient', () => {
  beforeEach(() => {
    clearAuthSession()
    mockedRefreshAuthTokens.mockReset()
  })

  afterEach(() => {
    httpClient.defaults.adapter = originalAdapter
    aiHttpClient.defaults.adapter = originalAiAdapter
    clearAuthSession()
  })

  it('adds the current access token to protected requests', async () => {
    setAuthTokens({ accessToken: 'access', refreshToken: 'refresh' }, true)
    const adapter = vi.fn<AxiosAdapter>(async (config) => response(config, { ok: true }))
    httpClient.defaults.adapter = adapter
    configureAuthHttpClient(vi.fn())

    await httpClient.get('/api/v1/protected')

    expect(adapter.mock.calls[0]?.[0].headers.get('Authorization')).toBe('Bearer access')
  })

  it('adds the current access token to AI server requests', async () => {
    setAuthTokens({ accessToken: 'access', refreshToken: 'refresh' }, true)
    const adapter = vi.fn<AxiosAdapter>(async (config) => response(config, { ok: true }))
    aiHttpClient.defaults.adapter = adapter
    configureAuthHttpClient(vi.fn())

    await aiHttpClient.get('/api/v1/scenario/recommendation')

    expect(adapter.mock.calls[0]?.[0].headers.get('Authorization')).toBe('Bearer access')
  })

  it('does not add an expired session token to a public login request', async () => {
    setAuthTokens({ accessToken: 'old-access', refreshToken: 'old-refresh' }, true)
    const adapter = vi.fn<AxiosAdapter>(async (config) => response(config, { ok: true }))
    httpClient.defaults.adapter = adapter
    configureAuthHttpClient(vi.fn())

    await httpClient.post('/api/v1/auth/login')

    expect(adapter.mock.calls[0]?.[0].headers.has('Authorization')).toBe(false)
  })

  it('authenticates AI requests but never exposes the token to third-party audio URLs', async () => {
    setAuthTokens({ accessToken: 'access', refreshToken: 'refresh' }, true)
    const adapter = vi.fn<AxiosAdapter>(async (config) => response(config, {}))
    aiHttpClient.defaults.adapter = adapter
    configureAuthHttpClient(vi.fn())

    await aiHttpClient.get('/api/v1/scenario/scenarios')
    await aiHttpClient.get('https://audio.example.com/example.wav')

    expect(adapter.mock.calls[0]?.[0].headers.get('Authorization')).toBe('Bearer access')
    expect(adapter.mock.calls[1]?.[0].headers.has('Authorization')).toBe(false)
  })

  it('refreshes once and retries concurrent unauthorized requests with the new token', async () => {
    const refreshToken = token({ sub: '34' })
    setAuthTokens({ accessToken: 'expired-access', refreshToken }, false)
    mockedRefreshAuthTokens.mockResolvedValue({
      accessToken: 'new-access',
      refreshToken: 'new-refresh',
    })
    const adapter = vi.fn<AxiosAdapter>(async (config) => {
      if (config.headers.get('Authorization') === 'Bearer new-access') {
        return response(config, { ok: true })
      }

      return Promise.reject({ config, response: { status: 401 } })
    })
    httpClient.defaults.adapter = adapter
    configureAuthHttpClient(vi.fn())

    const results = await Promise.all([
      httpClient.get('/api/v1/protected/one'),
      httpClient.get('/api/v1/protected/two'),
    ])

    expect(results.map(({ data }) => data)).toEqual([{ ok: true }, { ok: true }])
    expect(mockedRefreshAuthTokens).toHaveBeenCalledOnce()
    expect(mockedRefreshAuthTokens).toHaveBeenCalledWith({ refreshToken, userId: 34 })
    expect(getAccessToken()).toBe('new-access')
    expect(getRefreshToken()).toBe('new-refresh')
    expect(window.localStorage.getItem('bada.accessToken')).toBeNull()
    expect(window.sessionStorage.getItem('bada.accessToken')).toBe('new-access')
  })

  it('clears the session and redirects when token refresh fails', async () => {
    const refreshToken = token({ sub: '34' })
    setAuthTokens({ accessToken: 'expired-access', refreshToken }, true)
    mockedRefreshAuthTokens.mockRejectedValue(new Error('refresh failed'))
    httpClient.defaults.adapter = vi.fn<AxiosAdapter>((config) =>
      Promise.reject({ config, response: { status: 401 } }),
    )
    const onAuthenticationFailure = vi.fn()
    configureAuthHttpClient(onAuthenticationFailure)

    await expect(httpClient.get('/api/v1/protected')).rejects.toThrow('refresh failed')

    expect(getAccessToken()).toBeNull()
    expect(getRefreshToken()).toBeNull()
    expect(onAuthenticationFailure).toHaveBeenCalledOnce()
  })
})
