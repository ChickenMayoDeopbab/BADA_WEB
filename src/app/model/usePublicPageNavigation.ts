import { useLayoutEffect } from 'react'
import { useLocation } from 'react-router-dom'

/** 공개 페이지가 바뀌면 제목부터 읽을 수 있게 하고 섹션 링크의 위치는 유지합니다. */
export const usePublicPageNavigation = () => {
  const { pathname, hash } = useLocation()
  useLayoutEffect(() => {
    if (hash) document.getElementById(hash.slice(1))?.scrollIntoView()
    else window.scrollTo(0, 0)
  }, [pathname, hash])
}
