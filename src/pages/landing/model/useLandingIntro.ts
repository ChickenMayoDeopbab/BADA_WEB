import { useEffect, useState, type AnimationEvent } from 'react'

export const LANDING_INTRO_COMPLETE_EVENT = 'bada:landing-intro-complete'
let hasPlayedIntro = false

/** 첫 방문의 장식용 오프닝을 재생하며 입력·모션 설정·해시 이동에는 바로 양보합니다. */
export const useLandingIntro = () => {
  const [isIntroVisible, setIsIntroVisible] = useState(
    () =>
      !hasPlayedIntro &&
      !window.location.hash &&
      !window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  )

  useEffect(() => {
    if (!isIntroVisible) {
      window.dispatchEvent(new Event(LANDING_INTRO_COMPLETE_EVENT))
      return
    }
    hasPlayedIntro = true
    const media = window.matchMedia('(prefers-reduced-motion: reduce)')
    /** 오프닝은 스크롤이나 키보드 사용을 붙잡지 않습니다. */
    const finish = () => setIsIntroVisible(false)
    const timer = window.setTimeout(finish, 2000)
    const events = ['wheel', 'touchstart', 'pointerdown', 'keydown', 'hashchange'] as const
    events.forEach((event) => window.addEventListener(event, finish, { passive: true }))
    media.addEventListener('change', finish)
    return () => {
      window.clearTimeout(timer)
      events.forEach((event) => window.removeEventListener(event, finish))
      media.removeEventListener('change', finish)
    }
  }, [isIntroVisible])

  /** 자식 로고의 이벤트는 제외하고 배경의 마지막 프레임에서 오프닝을 닫습니다. */
  const handleIntroEnd = (event: AnimationEvent<HTMLDivElement>) => {
    if (event.target === event.currentTarget) setIsIntroVisible(false)
  }

  return { isIntroVisible, handleIntroEnd }
}
