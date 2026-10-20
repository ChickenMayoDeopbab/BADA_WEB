import { useSyncExternalStore } from 'react'

const scrollStoryQuery =
  '(min-width: 1024px) and (min-height: 680px) and (prefers-reduced-motion: no-preference)'

/** 충분한 화면 공간과 모션 선호도가 모두 충족되는지 구독합니다. */
const subscribe = (onChange: () => void) => {
  const query = window.matchMedia(scrollStoryQuery)
  query.addEventListener('change', onChange)
  return () => query.removeEventListener('change', onChange)
}

/** 짧은 화면·모바일·모션 줄이기에서는 일반 탭 레이아웃을 유지합니다. */
export const useScrollStoryEnabled = () =>
  useSyncExternalStore(
    subscribe,
    () => window.matchMedia(scrollStoryQuery).matches,
    () => false,
  )
