import { act, renderHook } from '@testing-library/react'
import { afterEach, expect, it } from 'vitest'
import { useTranslation } from './useTranslation'

afterEach(() => {
  localStorage.removeItem('bada:display-language')
  document.documentElement.lang = 'ko'
})

it('언어를 즉시 반영하고 다시 마운트해도 유지하며 원문 콘텐츠를 보존한다', () => {
  const { result, unmount } = renderHook(() => useTranslation())
  act(() => result.current.setLocale('en'))
  expect(result.current.t('커뮤니티')).toBe('Community')
  expect(result.current.t('constructor')).toBe('constructor')
  expect(result.current.t('사용자가 직접 쓴 문장')).toBe('사용자가 직접 쓴 문장')
  unmount()
  const next = renderHook(() => useTranslation())
  expect(next.result.current.locale).toBe('en')
  act(() => next.result.current.setLocale('ko'))
  expect(next.result.current.t('커뮤니티')).toBe('커뮤니티')
})

it('다른 탭의 언어 변경을 반영하고 지원하지 않는 값은 한국어로 처리한다', () => {
  const { result } = renderHook(() => useTranslation())
  act(() => {
    localStorage.setItem('bada:display-language', 'en')
    window.dispatchEvent(new StorageEvent('storage'))
  })
  expect(result.current.locale).toBe('en')
  act(() => {
    localStorage.setItem('bada:display-language', 'unsupported')
    window.dispatchEvent(new StorageEvent('storage'))
  })
  expect(result.current.locale).toBe('ko')
})
