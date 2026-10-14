import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

describe('AI development proxy configuration', () => {
  beforeEach(() => {
    vi.resetModules()
    vi.stubEnv('VITE_API_BASE_URL', 'https://spring.example.test')
    vi.stubEnv('VITE_AI_API_BASE_URL', 'https://ai.example.test')
  })
  afterEach(() => {
    vi.unstubAllEnvs()
    vi.resetModules()
  })

  it('uses the same origin for development AI HTTP and voice requests', async () => {
    vi.stubEnv('DEV', true)
    const { env } = await import('./env')
    expect(env.aiApiBaseUrl).toBe(`${window.location.origin}/__bada_ai`)
    expect(env.apiBaseUrl).toBe('https://spring.example.test')
  })

  it('uses the configured public AI URL in production without the development proxy', async () => {
    vi.stubEnv('DEV', false)
    const { env } = await import('./env')
    expect(env.aiApiBaseUrl).toBe('https://ai.example.test')
  })

  it('requires a valid upstream AI URL even when using the development proxy', async () => {
    vi.stubEnv('DEV', true)
    vi.stubEnv('VITE_AI_API_BASE_URL', '')
    await expect(import('./env')).rejects.toThrow('VITE_AI_API_BASE_URL')
  })
})
