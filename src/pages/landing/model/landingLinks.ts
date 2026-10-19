import { hasAuthSession } from '@features/auth'
import { routePaths } from '@shared/config'

/** 확인된 공식 HTTPS 주소만 외부 링크로 사용합니다. */
const readOfficialUrl = (value: string | undefined) => {
  if (!value?.trim()) return undefined
  try {
    const url = new URL(value.trim())
    return url.protocol === 'https:' ? url.href : undefined
  } catch {
    return undefined
  }
}

export const landingLinks = {
  appStore: readOfficialUrl(import.meta.env.VITE_BADA_APP_STORE_URL),
  oneStore: readOfficialUrl(import.meta.env.VITE_BADA_ONE_STORE_URL),
  instagram:
    readOfficialUrl(import.meta.env.VITE_BADA_INSTAGRAM_URL) ??
    'https://www.instagram.com/bada.callphobia/',
  github: 'https://github.com/orgs/ChickenMayoDeopbab',
  support: 'mailto:team.bada.service@gmail.com',
} as const

/** 로그인 전에는 로그인 화면에 실제 기능의 목적지를 전달합니다. */
export const getWebEntry = (destination: string) => ({
  to: hasAuthSession() ? destination : routePaths.login,
  state: { from: destination },
})
