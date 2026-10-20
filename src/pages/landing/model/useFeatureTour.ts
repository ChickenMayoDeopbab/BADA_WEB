import { useEffect, useRef, useState, type KeyboardEvent } from 'react'
import { scrollToPosition } from '@shared/lib'
import { tourFeatures } from './landingContent'
import { useScrollStoryEnabled } from './useScrollStoryEnabled'
import type { CallHintMode } from './practicePreview'

/** 고정된 제품 무대의 스크롤 진행과 직접 선택·키보드 탐색을 동기화합니다. */
export const useFeatureTour = () => {
  const [activeIndex, setActiveIndex] = useState(0)
  const [hintMode, setHintMode] = useState<CallHintMode>('advice')
  const [isSceneChanging, setIsSceneChanging] = useState(false)
  const storyRef = useRef<HTMLElement>(null)
  const cancelScroll = useRef<(() => void) | undefined>(undefined)
  const isScrollStory = useScrollStoryEnabled()
  useEffect(() => {
    const story = storyRef.current
    if (!story || !isScrollStory) return
    let isCanceled = false
    let cleanup: (() => void) | undefined
    /** 화면 높이에 맞춘 구간에만 ScrollTrigger를 연결합니다. */
    const initialize = async () => {
      const [{ gsap }, { ScrollTrigger }] = await Promise.all([
        import('gsap'),
        import('gsap/ScrollTrigger'),
      ])
      if (isCanceled) return
      gsap.registerPlugin(ScrollTrigger)
      const context = gsap.context(() => {
        const workspace = story.querySelector<HTMLElement>('.brand-tour-workspace')!
        const carrier = story.querySelector<HTMLElement>('[data-tour-carrier]')!
        const device = story.querySelector<HTMLElement>('[data-tour-device]')!
        /** 기기의 중심을 무대 너비의 비율로 지정해 화면 크기가 바뀌어도 경로를 유지합니다. */
        const positionAt = (ratio: number) => () =>
          workspace.clientWidth * ratio - carrier.offsetWidth / 2
        const timeline = gsap.timeline({
          defaults: { ease: 'power2.inOut' },
          scrollTrigger: {
            trigger: story,
            start: 'top 80px',
            end: 'bottom bottom',
            scrub: 0.3,
            invalidateOnRefresh: true,
            snap: {
              // 읽는 구간은 그대로 두고, 이동 중에 멈춘 경우에만 해당 방향의 완성 장면까지 이어갑니다.
              snapTo: (progress, trigger) => {
                if (!trigger?.isActive) return progress
                for (const [start, end] of [
                  [0.2, 0.4],
                  [0.6, 0.8],
                ]) {
                  if (progress > start && progress < end) {
                    return trigger.direction > 0 ? end : start
                  }
                }
                return progress
              },
              inertia: false,
              delay: 0.18,
              duration: { min: 0.18, max: 0.4 },
              ease: 'power2.inOut',
            },
          },
          onUpdate: () => {
            const progress = timeline.progress()
            const index = Math.min(
              tourFeatures.length - 1,
              progress < 0.3 ? 0 : progress < 0.7 ? 1 : 2,
            )
            // 기기가 설명 영역을 지나는 동안 글과 주석을 잠깐 비워 겹침을 피합니다.
            const distance = Math.min(Math.abs(progress - 0.3), Math.abs(progress - 0.7))
            const sceneOpacity = gsap.utils.clamp(0, 1, (distance - 0.06) / 0.04)
            setIsSceneChanging(sceneOpacity < 0.98)
            story.style.setProperty('--scene-opacity', String(sceneOpacity))
            story.style.setProperty('--tour-progress', String(progress))
            setActiveIndex((current) => (current === index ? current : index))
          },
        })
        timeline
          .to({}, { duration: 1 }, 0)
          .fromTo(
            carrier,
            { x: positionAt(0.66), y: 0, yPercent: -50 },
            { x: positionAt(0.22), y: 0, duration: 0.12 },
            0.24,
          )
          .to(carrier, { x: positionAt(0.66), y: 0, duration: 0.12 }, 0.64)
          .fromTo(
            device,
            { transformPerspective: 1400, rotationY: -12, rotationZ: 5 },
            { rotationY: 10, rotationZ: -4, duration: 0.12 },
            0.24,
          )
          .to(device, { rotationY: -6, rotationZ: 3, duration: 0.12 }, 0.64)
      }, story)
      cleanup = () => {
        context.revert()
        story.style.removeProperty('--scene-opacity')
        story.style.removeProperty('--tour-progress')
      }
    }
    void initialize()
    return () => {
      isCanceled = true
      cleanup?.()
      cancelScroll.current?.()
    }
  }, [isScrollStory])

  /** 탭을 누르면 애니메이션과 같은 타임라인의 해당 장면으로 이동합니다. */
  const selectFeature = (index: number) => {
    const story = storyRef.current
    if (!story || !isScrollStory) {
      setActiveIndex(index)
      return
    }
    const range = story.offsetHeight - (window.innerHeight - 80)
    const start = window.scrollY + story.getBoundingClientRect().top - 80
    const target = start + range * [0.12, 0.5, 0.88][index]
    if (Math.abs(window.scrollY - target) < 2) return
    cancelScroll.current?.()
    cancelScroll.current = scrollToPosition(target, true)
  }
  /** 방향키·Home·End로 장면과 초점을 함께 옮깁니다. */
  const handleTabKeyDown = (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
    const next =
      event.key === 'ArrowRight'
        ? (index + 1) % tourFeatures.length
        : event.key === 'ArrowLeft'
          ? (index + tourFeatures.length - 1) % tourFeatures.length
          : event.key === 'Home'
            ? 0
            : event.key === 'End'
              ? tourFeatures.length - 1
              : undefined
    if (next === undefined) return
    event.preventDefault()
    selectFeature(next)
    document.getElementById(`feature-tab-${tourFeatures[next].id}`)?.focus({ preventScroll: true })
  }
  return {
    activeIndex,
    storyRef,
    isScrollStory,
    selectFeature,
    handleTabKeyDown,
    hintMode,
    setHintMode,
    isSceneChanging,
  }
}
