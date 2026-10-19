import { useLayoutEffect, useRef } from 'react'
import { useLocation } from 'react-router-dom'
import { getSectionScrollTop, scrollToPosition } from '@shared/lib'

/** 공개 페이지가 바뀌면 제목부터 읽을 수 있게 하고 섹션 링크의 위치는 유지합니다. */
export const usePublicPageNavigation = () => {
  const { pathname, hash, key, state } = useLocation()
  const hasMounted = useRef(false)
  useLayoutEffect(() => {
    const shouldAnimate =
      hasMounted.current && (state as { scrollBehavior?: string } | null)?.scrollBehavior === 'fast'
    hasMounted.current = true
    if (hash) {
      const target = document.getElementById(hash.slice(1))
      if (target) return scrollToPosition(getSectionScrollTop(target), shouldAnimate)
    } else return scrollToPosition(0, shouldAnimate)
  }, [pathname, hash, key, state])
}
