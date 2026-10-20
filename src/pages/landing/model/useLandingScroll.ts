import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { landingSections, type LandingSectionId } from './landingSections'

/** 내비게이션 표시와 부드러운 섹션 이동을 관리합니다. */
export const useLandingScroll = () => {
  const pageRef = useRef<HTMLDivElement>(null)
  const navigate = useNavigate()
  const [activeSection, setActiveSection] = useState<LandingSectionId>('intro')

  useEffect(() => {
    const page = pageRef.current
    if (!page) return

    let animationFrame = 0
    let previousScrollY = window.scrollY
    let scrollDirection = 0
    let directionDistance = 0
    page.dataset.headerHidden = 'false'
    const sections = landingSections.map((section) => ({
      ...section,
      element: page.querySelector<HTMLElement>(`#${section.id}`)!,
    }))

    /** 헤더는 프레임당 한 번 갱신하고 현재 구간이 바뀔 때만 렌더링합니다. */
    const updateScroll = () => {
      animationFrame = 0
      const scrollRange = document.documentElement.scrollHeight - window.innerHeight
      const scrollY = Math.min(Math.max(0, scrollRange), Math.max(0, window.scrollY))
      const delta = scrollY - previousScrollY
      const nextDirection = Math.sign(delta)
      if (nextDirection && nextDirection !== scrollDirection) {
        scrollDirection = nextDirection
        directionDistance = 0
      }
      directionDistance += Math.abs(delta)
      if (scrollY <= 80) page.dataset.headerHidden = 'false'
      else if (scrollDirection > 0 && directionDistance >= 12) page.dataset.headerHidden = 'true'
      else if (scrollDirection < 0 && directionDistance >= 6) page.dataset.headerHidden = 'false'
      previousScrollY = scrollY
      const current =
        sections.findLast(
          (section) => section.element.getBoundingClientRect().top <= window.innerHeight * 0.45,
        ) ?? sections[0]
      setActiveSection((previous) => (previous === current.id ? previous : current.id))
    }

    /** 빠르게 연속 발생하는 스크롤과 크기 변경을 하나의 프레임으로 합칩니다. */
    const scheduleUpdate = () => {
      if (!animationFrame) animationFrame = window.requestAnimationFrame(updateScroll)
    }

    /** 일반 클릭만 라우터로 전달하여 브라우저의 순간 앵커 이동을 방지합니다. */
    const handleSectionClick = (event: MouseEvent) => {
      if (
        event.defaultPrevented ||
        event.button !== 0 ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey
      )
        return
      if (!(event.target instanceof Element)) return
      const link = event.target.closest<HTMLAnchorElement>('a[href]')
      if (!link || link.hasAttribute('download') || (link.target && link.target !== '_self')) return
      const url = new URL(link.href, window.location.href)
      if (
        url.origin !== window.location.origin ||
        url.pathname !== window.location.pathname ||
        url.search !== window.location.search ||
        !url.hash ||
        url.hash === '#main-content'
      )
        return
      if (!document.getElementById(url.hash.slice(1))) return
      event.preventDefault()
      navigate(
        { pathname: url.pathname, search: url.search, hash: url.hash },
        {
          state: { scrollBehavior: 'fast' },
          preventScrollReset: true,
        },
      )
    }

    updateScroll()
    const resizeObserver = new ResizeObserver(scheduleUpdate)
    resizeObserver.observe(page)
    window.addEventListener('scroll', scheduleUpdate, { passive: true })
    window.addEventListener('resize', scheduleUpdate)
    page.addEventListener('click', handleSectionClick)

    return () => {
      resizeObserver.disconnect()
      window.cancelAnimationFrame(animationFrame)
      window.removeEventListener('scroll', scheduleUpdate)
      window.removeEventListener('resize', scheduleUpdate)
      page.removeEventListener('click', handleSectionClick)
    }
  }, [navigate])

  return { pageRef, activeSection }
}
