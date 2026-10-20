import { useEffect, useRef, useState, type KeyboardEvent } from 'react'
import { scrollToPosition } from '@shared/lib'
import { tourFeatures } from './landingContent'
import { useScrollStoryMode } from './useScrollStoryMode'
import type { CallHintMode } from './callHints'

// Figma 화면 높이, 기기 테두리와 무대 여백을 반영하는 모바일 크기 제한입니다.
const mobileTourSizing = {
  screenHeight: 874,
  frameHeight: 10,
  reservedGap: 28,
  minScale: 0.12,
  maxScale: 0.48,
} as const

/** 고정된 제품 무대의 스크롤 진행과 직접 선택·키보드 탐색을 동기화합니다. */
export const useFeatureTour = () => {
  const [activeIndex, setActiveIndex] = useState(0)
  const [hintMode, setHintMode] = useState<CallHintMode>('advice')
  const [isSceneChanging, setIsSceneChanging] = useState(false)
  const storyRef = useRef<HTMLElement>(null)
  const cancelScroll = useRef<(() => void) | undefined>(undefined)
  const storyMode = useScrollStoryMode()
  const isScrollStory = storyMode !== 'static'
  const isMobileStory = storyMode === 'mobile'
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
      const stage = story.querySelector<HTMLElement>('[data-feature-stage]')!
      const workspace = story.querySelector<HTMLElement>('.brand-tour-workspace')!
      const callout = story.querySelector<HTMLElement>('[data-tour-callout]')!
      const panels = story.querySelectorAll<HTMLElement>('.brand-tour-panel')
      /** 글과 주석의 공간을 먼저 확보하고 남는 높이에 맞춰 세로 목업을 줄입니다. */
      const fitMobileDevice = () => {
        if (!isMobileStory) return
        const panel = story.querySelector<HTMLElement>('.brand-tour-panel:not([hidden])')!
        const hasSideCallout =
          getComputedStyle(callout).getPropertyValue('--tour-callout-layout').trim() === 'side'
        const availableHeight =
          workspace.clientHeight -
          panel.offsetHeight -
          (hasSideCallout ? 0 : callout.offsetHeight) -
          mobileTourSizing.reservedGap
        const availableScale =
          (availableHeight - mobileTourSizing.frameHeight) / mobileTourSizing.screenHeight
        const deviceScale = Math.min(
          mobileTourSizing.maxScale,
          Math.max(mobileTourSizing.minScale, availableScale),
        )
        story.style.setProperty('--tour-mobile-device-scale', String(deviceScale))
      }
      fitMobileDevice()
      const resizeObserver = new ResizeObserver(fitMobileDevice)
      if (isMobileStory) {
        resizeObserver.observe(workspace)
        resizeObserver.observe(callout)
        panels.forEach((panel) => resizeObserver.observe(panel))
      }
      const context = gsap.context(() => {
        const carrier = story.querySelector<HTMLElement>('[data-tour-carrier]')!
        const device = story.querySelector<HTMLElement>('[data-tour-device]')!
        /** 기기의 중심을 무대 너비의 비율로 지정해 화면 크기가 바뀌어도 경로를 유지합니다. */
        const positionAt = (ratio: number) => () =>
          workspace.clientWidth * ratio - carrier.offsetWidth / 2
        const timeline = gsap.timeline({
          defaults: { ease: 'power2.inOut' },
          scrollTrigger: {
            trigger: story,
            start: () => `top ${Number.parseFloat(getComputedStyle(stage).top) || 0}px`,
            end: () => `+=${story.offsetHeight - stage.offsetHeight}`,
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
            const sceneOpacity = isMobileStory
              ? 1
              : gsap.utils.clamp(0, 1, (distance - 0.06) / 0.04)
            setIsSceneChanging(sceneOpacity < 0.98)
            story.style.setProperty('--scene-opacity', String(sceneOpacity))
            story.style.setProperty('--tour-progress', String(progress))
            setActiveIndex((current) => (current === index ? current : index))
          },
        })
        timeline.to({}, { duration: 1 }, 0)
        if (!isMobileStory)
          timeline
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
        resizeObserver.disconnect()
        context.revert()
        story.style.removeProperty('--tour-mobile-device-scale')
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
  }, [isScrollStory, isMobileStory])

  /** 탭을 누르면 애니메이션과 같은 타임라인의 해당 장면으로 이동합니다. */
  const selectFeature = (index: number) => {
    const story = storyRef.current
    if (!story || !isScrollStory) {
      setActiveIndex(index)
      return
    }
    const stage = story.querySelector<HTMLElement>('[data-feature-stage]')!
    const range = story.offsetHeight - stage.offsetHeight
    const stageTop = Number.parseFloat(getComputedStyle(stage).top) || 0
    const start = window.scrollY + story.getBoundingClientRect().top - stageTop
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
    isMobileStory,
    selectFeature,
    handleTabKeyDown,
    hintMode,
    setHintMode,
    isSceneChanging,
  }
}
