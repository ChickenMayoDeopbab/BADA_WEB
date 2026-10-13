import { mergeConfig } from 'vite'
import { defineConfig } from 'vitest/config'
import viteConfig from './vite.config.ts'

export default mergeConfig(
  viteConfig,
  defineConfig({
    test: {
      environment: 'jsdom',
      include: ['src/**/*.test.{ts,tsx}'],
      setupFiles: ['./src/test/setup.ts'],
      env: {
        VITE_API_BASE_URL: 'http://127.0.0.1:8080',
        VITE_AI_API_BASE_URL: 'http://127.0.0.1:8000',
      },
    },
  }),
)
