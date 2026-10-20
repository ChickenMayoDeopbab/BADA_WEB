import { useState } from 'react'

/** 서버나 마이크 없이 첫 인사를 주고받는 히어로 미리보기를 제어합니다. */
export const useHeroConversation = () => {
  const [hasAnswered, setHasAnswered] = useState(false)

  /** 첫 인사를 표시하거나 미리보기를 처음 상태로 되돌립니다. */
  const toggleAnswer = () => setHasAnswered((previous) => !previous)

  return { hasAnswered, toggleAnswer }
}
