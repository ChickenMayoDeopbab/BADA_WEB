import { useEffect, type RefObject } from 'react'

/** 구간에 들어온 뒤에는 스크롤을 멈춰도 끝까지 재생되는 리빌을 소유합니다. */
export const useLandingSectionMotion = (pageRef: RefObject<HTMLDivElement | null>) => {
  useEffect(() => {
    const page = pageRef.current
    if (!page) return
    let isCanceled = false
    let cleanup: (() => void) | undefined

    /** 기존 목업의 좌표를 건드리지 않고 각 구간의 제목과 내용에 별도 타임라인을 만듭니다. */
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
          const removeListeners: (() => void)[] = []
          for (const id of ['experience', 'diagnosis', 'faq', 'download']) {
            const section = page.querySelector<HTMLElement>(`#${id}`)!
            const heading = section.querySelector<HTMLElement>('h2')!
            const content = section.querySelectorAll<HTMLElement>(
              id === 'experience'
                ? '.brand-tour-tabs'
                : id === 'diagnosis'
                  ? '.landing-diagnosis-panel'
                  : id === 'faq'
                    ? 'details'
                    : '.brand-download-wordmark',
            )
            const timeline = gsap.timeline({
              paused: true,
              defaults: { duration: 1, ease: 'power3.out', immediateRender: false },
            })
            timeline.fromTo(
              heading,
              { yPercent: 45, clipPath: 'inset(100% 0% 0% 0%)' },
              { yPercent: 0, clipPath: 'inset(0% 0% 0% 0%)', clearProps: 'transform,clipPath' },
            )
            timeline.fromTo(
              content,
              id === 'faq'
                ? { x: 56 }
                : id === 'download'
                  ? { y: 44, scale: 0.88 }
                  : { y: 56, scale: 0.97 },
              { x: 0, y: 0, scale: 1, duration: 1.1, stagger: 0.1, clearProps: 'transform' },
              0.1,
            )
            /** 입력 중인 폼은 움직이지 않고 즉시 읽을 수 있는 상태로 둡니다. */
            const finish = () => {
              timeline.progress(1).pause()
            }
            /** 같은 구간으로 돌아오면 다시 펼치되 키보드 초점은 우선합니다. */
            const reveal = () => {
              if (document.activeElement && section.contains(document.activeElement)) finish()
              else timeline.restart()
            }
            ScrollTrigger.create({
              trigger: section,
              start: 'top 78%',
              end: 'bottom 15%',
              onEnter: reveal,
              onEnterBack: reveal,
              onLeave: finish,
              onLeaveBack: finish,
            })
            section.addEventListener('focusin', finish)
            section.addEventListener('pointerdown', finish, { passive: true })
            removeListeners.push(() => {
              section.removeEventListener('focusin', finish)
              section.removeEventListener('pointerdown', finish)
            })
          }
          return () => removeListeners.forEach((remove) => remove())
        },
        page,
      )
      cleanup = () => media.revert()
    }
    void initialize()
    return () => {
      isCanceled = true
      cleanup?.()
    }
  }, [pageRef])
}
