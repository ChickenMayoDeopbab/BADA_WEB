import { useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'

/** 스크롤 진행, 히어로 시차와 한 번씩 등장하는 요소를 랜딩 안에서만 관리합니다. */
export const useLandingScroll = () => {
  const pageRef = useRef<HTMLDivElement>(null)
  const navigate = useNavigate()

  useEffect(() => {
    const page = pageRef.current
    if (!page) return

    const motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)')
    const hero = page.querySelector<HTMLElement>('[data-landing-hero]')
    const story = page.querySelector<HTMLElement>('[data-landing-story]')
    const storyLines = Array.from(page.querySelectorAll<HTMLElement>('[data-story-line]'))
    const revealElements = Array.from(page.querySelectorAll<HTMLElement>('[data-reveal]'))
    let observer: IntersectionObserver | undefined
    let animationFrame = 0
    let previousScrollY = window.scrollY
    let scrollDirection = 0
    let directionDistance = 0
    page.dataset.headerHidden = 'false'

    /** DOM 상태는 프레임당 한 번만 갱신하며 React 렌더링을 발생시키지 않습니다. */
    const updateScroll = () => {
      animationFrame = 0
      const scrollRange = document.documentElement.scrollHeight - window.innerHeight
      const scrollY = Math.min(Math.max(0, scrollRange), Math.max(0, window.scrollY))
      const progress = scrollRange > 0 ? scrollY / scrollRange : 0
      page.style.setProperty('--landing-scroll-progress', String(progress))
      page.dataset.scrolled = String(scrollY > 24)
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

      if (hero && !motionPreference.matches) {
        const { top, height } = hero.getBoundingClientRect()
        const heroProgress = Math.min(1, Math.max(0, -top / Math.max(height, 1)))
        page.style.setProperty('--landing-hero-progress', String(heroProgress))
      }
      if (story && !motionPreference.matches) {
        const top = story.getBoundingClientRect().top
        const progress = Math.max(
          0,
          Math.min(1, (window.innerHeight * 0.8 - top) / (window.innerHeight * 0.65)),
        )
        storyLines.forEach((line, index) => {
          const emphasis =
            0.25 + Math.max(0, Math.min(1, progress * storyLines.length - index)) * 0.75
          line.style.setProperty('--story-line-emphasis', String(emphasis))
        })
      }
    }

    /** 빠르게 연속 발생하는 스크롤과 크기 변경을 하나의 프레임으로 합칩니다. */
    const scheduleUpdate = () => {
      if (!animationFrame) animationFrame = window.requestAnimationFrame(updateScroll)
    }

    /** 모션 설정이 바뀌면 숨겨진 콘텐츠를 즉시 복원하고 관찰을 다시 구성합니다. */
    const configureMotion = () => {
      observer?.disconnect()
      page.dataset.motion = String(!motionPreference.matches)
      page.style.setProperty('--landing-hero-progress', '0')
      storyLines.forEach((line) => line.style.setProperty('--story-line-emphasis', '1'))
      revealElements.forEach((element) => {
        element.dataset.revealState = 'visible'
      })
      if (motionPreference.matches) return

      observer = new IntersectionObserver(
        (entries) => {
          entries.forEach(({ target, isIntersecting }) => {
            if (!isIntersecting) return
            ;(target as HTMLElement).dataset.revealState = 'visible'
            observer?.unobserve(target)
          })
        },
        { rootMargin: '0px 0px -5% 0px', threshold: 0.05 },
      )

      revealElements.forEach((element) => {
        if (element.getBoundingClientRect().top >= window.innerHeight) {
          element.dataset.revealState = 'pending'
          observer?.observe(element)
        }
      })
    }

    /** 키보드로 이동한 콘텐츠는 등장 효과가 끝나기 전에도 읽을 수 있게 합니다. */
    const handleFocus = (event: FocusEvent) => {
      if (!(event.target instanceof Element)) return
      if (event.target.closest('[data-landing-header]')) {
        page.dataset.headerHidden = 'false'
        directionDistance = 0
      }
      const element = event.target.closest<HTMLElement>('[data-reveal]')
      if (element) {
        element.dataset.revealState = 'visible'
        observer?.unobserve(element)
      }
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

    /** 랜딩의 텍스트·이미지·링크에 브라우저 기본 드래그가 시작되지 않게 합니다. */
    const handleDragStart = (event: DragEvent) => event.preventDefault()

    configureMotion()
    updateScroll()
    const resizeObserver = new ResizeObserver(scheduleUpdate)
    resizeObserver.observe(page)
    window.addEventListener('scroll', scheduleUpdate, { passive: true })
    window.addEventListener('resize', scheduleUpdate)
    page.addEventListener('focusin', handleFocus)
    page.addEventListener('click', handleSectionClick)
    page.addEventListener('dragstart', handleDragStart)
    motionPreference.addEventListener('change', configureMotion)

    return () => {
      observer?.disconnect()
      resizeObserver.disconnect()
      window.cancelAnimationFrame(animationFrame)
      window.removeEventListener('scroll', scheduleUpdate)
      window.removeEventListener('resize', scheduleUpdate)
      page.removeEventListener('focusin', handleFocus)
      page.removeEventListener('click', handleSectionClick)
      page.removeEventListener('dragstart', handleDragStart)
      motionPreference.removeEventListener('change', configureMotion)
    }
  }, [navigate])

  return { pageRef }
}
