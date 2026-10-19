import { useState, type KeyboardEvent } from 'react'
import { tourFeatures } from './landingContent'

/** 기능 소개 탭의 선택 상태와 키보드 이동을 관리합니다. */
export const useFeatureTour = () => {
  const [activeIndex, setActiveIndex] = useState(0)

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
    setActiveIndex(nextIndex)
    document.getElementById(`feature-tab-${tourFeatures[nextIndex].id}`)?.focus()
  }

  return {
    activeIndex,
    activeFeature: tourFeatures[activeIndex],
    selectFeature: setActiveIndex,
    handleTabKeyDown,
  }
}
