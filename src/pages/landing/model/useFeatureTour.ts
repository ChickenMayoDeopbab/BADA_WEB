import { useEffect, useRef, useState, type KeyboardEvent } from 'react'
import { scrollToPosition } from '@shared/lib'
import { tourFeatures } from './landingContent'
import { useScrollStoryEnabled } from './useScrollStoryEnabled'

/** 고정된 제품 무대의 스크롤 진행과 직접 선택·키보드 탐색을 동기화합니다. */
export const useFeatureTour = () => {
  const [activeIndex, setActiveIndex] = useState(0)
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
      const trigger = ScrollTrigger.create({
        trigger: story,
        start: 'top 80px',
        end: 'bottom bottom',
        onUpdate: ({ progress }) => {
          const index = Math.min(
            tourFeatures.length - 1,
            Math.floor(progress * tourFeatures.length),
          )
          story.style.setProperty('--tour-progress', String(progress))
          setActiveIndex((current) => (current === index ? current : index))
        },
      })
      cleanup = () => trigger.kill()
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
    setActiveIndex(index)
    const story = storyRef.current
    if (!story || !isScrollStory) return
    const range = story.offsetHeight - (window.innerHeight - 80)
    const start = window.scrollY + story.getBoundingClientRect().top - 80
    cancelScroll.current?.()
    cancelScroll.current = scrollToPosition(
      start + range * ((index + 0.35) / tourFeatures.length),
      true,
    )
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
  return { activeIndex, storyRef, isScrollStory, selectFeature, handleTabKeyDown }
}
