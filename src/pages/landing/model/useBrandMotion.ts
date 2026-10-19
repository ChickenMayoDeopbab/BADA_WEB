import { useEffect, type RefObject } from 'react'
import { buildVoicePath } from './brandMotion'

/** 장면별 마스크·파형·타이포 모션을 소유하고 라우트 및 모션 설정 변경 시 복원합니다. */
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
          intro.from(select('[data-hero-footnote]'), { y: 18, autoAlpha: 0, duration: 0.6 }, 0.7)
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
          const manifesto = select('[data-manifesto]')[0]
          gsap.fromTo(
            select('[data-manifesto-ink]'),
            { clipPath: 'inset(0% 100% 0% 0%)' },
            {
              clipPath: 'inset(0% 0% 0% 0%)',
              ease: 'none',
              scrollTrigger: {
                trigger: manifesto,
                start: 'top 65%',
                end: 'center 35%',
                scrub: 0.6,
              },
            },
          )
          gsap.fromTo(
            select('[data-orbit-stroke]'),
            { strokeDashoffset: 1 },
            {
              strokeDashoffset: 0,
              ease: 'none',
              scrollTrigger: {
                trigger: manifesto,
                start: 'top 80%',
                end: 'bottom 30%',
                scrub: 0.7,
              },
            },
          )
          const photo = select('[data-life-photo]')[0]
          gsap.fromTo(
            photo,
            { clipPath: 'inset(14% 22% 14% 22%)' },
            {
              clipPath: 'inset(0% 0% 0% 0%)',
              ease: 'none',
              scrollTrigger: { trigger: photo, start: 'top 85%', end: 'top 15%', scrub: 0.8 },
            },
          )
          gsap.fromTo(
            select('[data-life-photo] img'),
            { yPercent: -8, scale: 1.15 },
            {
              yPercent: 8,
              scale: 1,
              ease: 'none',
              scrollTrigger: { trigger: photo, start: 'top bottom', end: 'bottom top', scrub: 0.8 },
            },
          )
          gsap.from(select('[data-footer-wordmark]'), {
            yPercent: 25,
            ease: 'none',
            scrollTrigger: {
              trigger: select('[data-footer-wordmark]')[0],
              start: 'top bottom',
              end: 'bottom bottom',
              scrub: 0.5,
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
