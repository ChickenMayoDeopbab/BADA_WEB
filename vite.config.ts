import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

export default defineConfig({
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
})
