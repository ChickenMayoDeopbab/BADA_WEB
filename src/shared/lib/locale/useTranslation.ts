import { useSyncExternalStore } from 'react'
import { english } from './translations'

export type Locale = 'ko' | 'en'
const storageKey = 'bada:display-language'
const eventName = 'bada:display-language-changed'
let temporaryLocale: Locale = 'ko'

/** 저장소 접근이 제한된 환경에서도 기본 한국어로 화면을 표시합니다. */
const getLocale = (): Locale => {
  try {
    return localStorage.getItem(storageKey) === 'en' ? 'en' : 'ko'
  } catch {
    return temporaryLocale
  }
}

/** 현재 탭과 다른 탭의 언어 변경을 구독합니다. */
const subscribe = (onChange: () => void) => {
  window.addEventListener('storage', onChange)
  window.addEventListener(eventName, onChange)
  return () => {
    window.removeEventListener('storage', onChange)
    window.removeEventListener(eventName, onChange)
  }
}

/** 실제 번역이 제공되는 언어만 선택하며 통화나 인증 상태를 재생성하지 않습니다. */
export const useTranslation = () => {
  const locale = useSyncExternalStore(subscribe, getLocale, () => 'ko' as const)
  const setLocale = (value: Locale) => {
    temporaryLocale = value
    try {
      localStorage.setItem(storageKey, value)
    } catch {
      /* 저장소가 제한되어도 현재 탭의 표시 언어는 변경합니다. */
    }
    document.documentElement.lang = value
    window.dispatchEvent(new Event(eventName))
  }
  return {
    locale,
    setLocale,
    t: (text: string) => (locale === 'en' && Object.hasOwn(english, text) ? english[text] : text),
  }
}
