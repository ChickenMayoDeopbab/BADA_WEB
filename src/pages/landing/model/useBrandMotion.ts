import { useEffect, type RefObject } from 'react'
import { buildVoicePath } from './brandMotion'

/** 히어로의 파형·타이포 모션을 소유하고 라우트 및 모션 설정 변경 시 복원합니다. */
export const useBrandMotion = (pageRef: RefObject<HTMLDivElement | null>) => {
  useEffect(() => {
    const page = pageRef.current
    if (!page) return
    let isCanceled = false
    let cleanup: (() => void) | undefined

    /** 애니메이션 코드는 랜딩 진입 후에만 가져와 다른 서비스 화면의 초기 비용을 줄입니다. */
    const initialize = async () => {
      const [{ gsap }, { ScrollTrigger }] = await Promise.all([
        import('gsap'),
        import('gsap/ScrollTrigger'),
      ])
      if (isCanceled) return
      gsap.registerPlugin(ScrollTrigger)
      const media = gsap.matchMedia()
      media.add(
        '(prefers-reduced-motion: no-preference)',
        () => {
          const select = gsap.utils.selector(page)
          const intro = gsap.timeline({ defaults: { ease: 'power3.out' } })
          intro.from(select('[data-hero-line]'), { yPercent: 115, duration: 1.15, stagger: 0.14 })
          intro.from(
            select('[data-hero-object]'),
            { clipPath: 'inset(100% 0% 0% 0%)', duration: 1.1 },
            0.25,
          )
          intro.from(select('[data-hero-action]'), { y: 18, autoAlpha: 0, duration: 0.6 }, 0.7)
          gsap.to(select('[data-voice-path]'), {
            attr: { d: buildVoicePath(true) },
            ease: 'none',
            scrollTrigger: {
              trigger: select('[data-landing-hero]')[0],
              start: 'top top',
              end: 'bottom top',
              scrub: 0.8,
            },
          })
          gsap.to(select('[data-hero-object]'), {
            y: -80,
            rotation: -5,
            ease: 'none',
            scrollTrigger: {
              trigger: select('[data-landing-hero]')[0],
              start: 'top top',
              end: 'bottom top',
              scrub: 0.8,
            },
          })
        },
        page,
      )
      cleanup = () => media.revert()
      page.dataset.brandReady = 'true'
      void document.fonts.ready.then(() => {
        if (!isCanceled) ScrollTrigger.refresh()
      })
    }
    void initialize()
    return () => {
      isCanceled = true
      cleanup?.()
    }
  }, [pageRef])
}
