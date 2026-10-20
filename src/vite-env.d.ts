/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL: string
  readonly VITE_AI_API_BASE_URL: string
  readonly VITE_BADA_APP_STORE_URL?: string
  readonly VITE_BADA_GOOGLE_PLAY_URL?: string
  readonly VITE_BADA_INSTAGRAM_URL?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
