import { useEffect, type RefObject } from 'react'
import { buildVoicePath } from './brandMotion'

/** 히어로 모션을 소유하고 라우트 및 모션 설정 변경 시 복원합니다. */
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
          const hero = page.querySelector<HTMLElement>('[data-landing-hero]')!
          const voicePath = page.querySelector<SVGPathElement>('[data-voice-path]')!
          const originalPath = voicePath.getAttribute('d')!
          const voice = { calm: 0 }
          let phase = 0
          let lastPaint = gsap.ticker.time
          let isVoiceActive = false

          /** 초당 30회만 선을 다시 그려 제자리에서 부드럽게 꼼지락거리게 합니다. */
          const renderVoice = (time: number) => {
            const elapsed = time - lastPaint
            if (elapsed < 1 / 30) return
            lastPaint = time
            phase += Math.min(elapsed, 0.1) * 1.3
            voicePath.setAttribute('d', buildVoicePath(voice.calm, phase))
          }

          /** 첫 화면을 벗어나거나 탭이 숨겨지면 반복 렌더링을 멈춥니다. */
          const updateVoiceVisibility = () => {
            const bounds = hero.getBoundingClientRect()
            const shouldAnimate =
              !document.hidden && bounds.bottom > 0 && bounds.top < window.innerHeight
            if (shouldAnimate === isVoiceActive) return
            isVoiceActive = shouldAnimate
            if (shouldAnimate) {
              lastPaint = gsap.ticker.time
              gsap.ticker.add(renderVoice)
            } else gsap.ticker.remove(renderVoice)
          }
          const intro = gsap.timeline({ defaults: { ease: 'power3.out' } })
          intro.from(select('[data-hero-line]'), { yPercent: 115, duration: 1.15, stagger: 0.14 })
          intro.from(
            select('[data-hero-object]'),
            { clipPath: 'inset(100% 0% 0% 0%)', duration: 1.1 },
            0.25,
          )
          intro.from(select('[data-hero-action]'), { y: 18, autoAlpha: 0, duration: 0.6 }, 0.7)
          gsap.to(voice, {
            calm: 1,
            ease: 'none',
            scrollTrigger: {
              trigger: hero,
              start: 'top top',
              end: 'bottom top',
              scrub: 0.8,
              onToggle: updateVoiceVisibility,
            },
          })
          document.addEventListener('visibilitychange', updateVoiceVisibility)
          updateVoiceVisibility()
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
          return () => {
            gsap.ticker.remove(renderVoice)
            document.removeEventListener('visibilitychange', updateVoiceVisibility)
            voicePath.setAttribute('d', originalPath)
          }
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
