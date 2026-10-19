import { useEffect, useRef, useState, type KeyboardEvent } from 'react'
import { tourFeatures } from './landingContent'
import { useScrollStoryEnabled } from './useScrollStoryEnabled'

/** 기능 소개 탭의 선택 상태와 키보드 이동을 관리합니다. */
export const useFeatureTour = () => {
  const [activeIndex, setActiveIndex] = useState(0)
  const storyRef = useRef<HTMLElement>(null)
  const isScrollStory = useScrollStoryEnabled()

  useEffect(() => {
    const story = storyRef.current
    if (!isScrollStory || !story) return
    let animationFrame = 0
    let previousIndex = -1

    /** 고정 구간 안에서의 위치를 네 개의 기능 단계로 변환합니다. */
    const updateStory = () => {
      animationFrame = 0
      const { top, height } = story.getBoundingClientRect()
      const stage = story.querySelector<HTMLElement>('[data-feature-stage]')
      const range = height - (stage?.offsetHeight ?? window.innerHeight - 80)
      const progress = Math.min(1, Math.max(0, (80 - top) / Math.max(range, 1)))
      const nextIndex = Math.min(
        tourFeatures.length - 1,
        Math.floor(progress * tourFeatures.length),
      )
      story.style.setProperty(
        '--feature-stage-progress',
        String(progress === 1 ? 1 : progress * tourFeatures.length - nextIndex),
      )
      if (nextIndex !== previousIndex) {
        story.dataset.scrollDirection = nextIndex < previousIndex ? 'backward' : 'forward'
        previousIndex = nextIndex
        setActiveIndex(nextIndex)
      }
    }

    /** 스크롤 위치 계산을 프레임당 한 번으로 제한합니다. */
    const scheduleUpdate = () => {
      if (!animationFrame) animationFrame = window.requestAnimationFrame(updateStory)
    }

    updateStory()
    window.addEventListener('scroll', scheduleUpdate, { passive: true })
    window.addEventListener('resize', scheduleUpdate)
    return () => {
      window.cancelAnimationFrame(animationFrame)
      window.removeEventListener('scroll', scheduleUpdate)
      window.removeEventListener('resize', scheduleUpdate)
    }
  }, [isScrollStory])

  /** 탭을 직접 선택해도 해당 스크롤 단계로 이동하여 선택 상태를 일치시킵니다. */
  const selectFeature = (index: number) => {
    setActiveIndex(index)
    const story = storyRef.current
    if (!isScrollStory || !story) return
    const stage = story.querySelector<HTMLElement>('[data-feature-stage]')
    const range = story.offsetHeight - (stage?.offsetHeight ?? window.innerHeight - 80)
    const top = window.scrollY + story.getBoundingClientRect().top - 80
    window.scrollTo({
      top: top + range * ((index + 0.15) / tourFeatures.length),
      behavior: 'smooth',
    })
  }

  /** 방향키와 Home/End로 선택 탭과 키보드 초점을 함께 이동합니다. */
  const handleTabKeyDown = (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
    let nextIndex: number
    if (event.key === 'ArrowRight') nextIndex = (index + 1) % tourFeatures.length
    else if (event.key === 'ArrowLeft')
      nextIndex = (index - 1 + tourFeatures.length) % tourFeatures.length
    else if (event.key === 'Home') nextIndex = 0
    else if (event.key === 'End') nextIndex = tourFeatures.length - 1
    else return
    event.preventDefault()
    selectFeature(nextIndex)
    document.getElementById(`feature-tab-${tourFeatures[nextIndex].id}`)?.focus()
  }

  return {
    activeIndex,
    storyRef,
    isScrollStory,
    activeFeature: tourFeatures[activeIndex],
    selectFeature,
    handleTabKeyDown,
  }
}
