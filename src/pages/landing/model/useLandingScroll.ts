import { useEffect, useRef } from 'react'

/** 스크롤 진행, 히어로 시차와 한 번씩 등장하는 요소를 랜딩 안에서만 관리합니다. */
export const useLandingScroll = () => {
  const pageRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const page = pageRef.current
    if (!page) return

    const motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)')
    const hero = page.querySelector<HTMLElement>('[data-landing-hero]')
    const revealElements = Array.from(page.querySelectorAll<HTMLElement>('[data-reveal]'))
    let observer: IntersectionObserver | undefined
    let animationFrame = 0

    /** DOM 상태는 프레임당 한 번만 갱신하며 React 렌더링을 발생시키지 않습니다. */
    const updateScroll = () => {
      animationFrame = 0
      const scrollRange = document.documentElement.scrollHeight - window.innerHeight
      const progress = scrollRange > 0 ? Math.min(1, Math.max(0, window.scrollY / scrollRange)) : 0
      page.style.setProperty('--landing-scroll-progress', String(progress))
      page.dataset.scrolled = String(window.scrollY > 24)

      if (hero && !motionPreference.matches) {
        const { top, height } = hero.getBoundingClientRect()
        const heroProgress = Math.min(1, Math.max(0, (80 - top) / Math.max(height, 1)))
        page.style.setProperty('--landing-hero-progress', String(heroProgress))
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
      const element = event.target.closest<HTMLElement>('[data-reveal]')
      if (element) {
        element.dataset.revealState = 'visible'
        observer?.unobserve(element)
      }
    }

    configureMotion()
    updateScroll()
    const resizeObserver = new ResizeObserver(scheduleUpdate)
    resizeObserver.observe(page)
    window.addEventListener('scroll', scheduleUpdate, { passive: true })
    window.addEventListener('resize', scheduleUpdate)
    page.addEventListener('focusin', handleFocus)
    motionPreference.addEventListener('change', configureMotion)

    return () => {
      observer?.disconnect()
      resizeObserver.disconnect()
      window.cancelAnimationFrame(animationFrame)
      window.removeEventListener('scroll', scheduleUpdate)
      window.removeEventListener('resize', scheduleUpdate)
      page.removeEventListener('focusin', handleFocus)
      motionPreference.removeEventListener('change', configureMotion)
    }
  }, [])

  return { pageRef }
}
