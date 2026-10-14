import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

/** 개발 브라우저의 AI REST/음성 요청을 기존 서버로 전달합니다. */
export default defineConfig(({ mode }) => {
  const environment = loadEnv(mode, import.meta.dirname, 'VITE_')
  const aiApiTarget = environment.VITE_AI_API_BASE_URL
  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@app': path.resolve(import.meta.dirname, './src/app'),
        '@pages': path.resolve(import.meta.dirname, './src/pages'),
        '@widgets': path.resolve(import.meta.dirname, './src/widgets'),
        '@features': path.resolve(import.meta.dirname, './src/features'),
        '@entities': path.resolve(import.meta.dirname, './src/entities'),
        '@shared': path.resolve(import.meta.dirname, './src/shared'),
      },
    },
    server: {
      // 다른 체크아웃이 같은 포트를 쓰면 자동으로 다른 포트에 뜨지 않도록 합니다.
      port: 5173,
      strictPort: true,
      proxy: aiApiTarget
        ? {
            '/__bada_ai': {
              target: aiApiTarget,
              changeOrigin: true,
              ws: true,
              rewrite: (requestPath: string) => requestPath.replace(/^\/__bada_ai/, ''),
            },
          }
        : undefined,
    },
  }
})
