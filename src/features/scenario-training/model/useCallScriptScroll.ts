import type { ScenarioDialogueTurn } from '@entities/scenario'
import { useLayoutEffect, useRef } from 'react'

/** 앱의 스크립트처럼 최신 발화로 이동하며 추천 문장은 스크롤 영역 밖에 유지합니다. */
export const useCallScriptScroll = (isOpen: boolean, script: ScenarioDialogueTurn[]) => {
  const scrollRef = useRef<HTMLDivElement>(null)
  useLayoutEffect(() => {
    if (!isOpen || !scrollRef.current) return
    scrollRef.current.scrollTop = scrollRef.current.scrollHeight
  }, [isOpen, script])
  return scrollRef
}
