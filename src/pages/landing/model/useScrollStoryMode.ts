import { useSyncExternalStore } from 'react'

const storyQueries = {
  desktop:
    '(min-width: 1024px) and (min-height: 680px) and (prefers-reduced-motion: no-preference)',
  mobile: '(max-width: 1023px) and (min-height: 568px) and (prefers-reduced-motion: no-preference)',
} as const

/** 화면 크기나 모션 선호도가 바뀌면 무대 레이아웃도 함께 전환합니다. */
const subscribe = (onChange: () => void) => {
  const queries = Object.values(storyQueries).map((query) => window.matchMedia(query))
  queries.forEach((query) => query.addEventListener('change', onChange))
  return () => queries.forEach((query) => query.removeEventListener('change', onChange))
}

/** 넓은 화면의 좌우 이동과 세로 화면의 고정 목업, 짧은 화면의 탭 탐색을 구분합니다. */
const getStoryMode = () =>
  window.matchMedia(storyQueries.desktop).matches
    ? 'desktop'
    : window.matchMedia(storyQueries.mobile).matches
      ? 'mobile'
      : 'static'

/** 세로 모바일에도 스크롤 연동을 제공하고 모션 줄이기는 일반 탭으로 복원합니다. */
export const useScrollStoryMode = () =>
  useSyncExternalStore(subscribe, getStoryMode, () => 'static')
