import { useState } from 'react'

const conversations = [
  { greeting: '여보세요?', reply: '네, 안녕하세요.' },
  { greeting: '주문이요?', reply: '포장할게요.' },
  { greeting: '언제요?', reply: '내일 가능해요.' },
  { greeting: '성함은요?', reply: '김바다입니다.' },
  { greeting: '다시요?', reply: '다시 말할게요.' },
  { greeting: '또요?', reply: '이게 전부예요.' },
  { greeting: '됐습니다.', reply: '감사합니다.' },
  { greeting: '괜찮아요.', reply: '다시 해볼게요.' },
] as const

/** 서버나 마이크 없이 여러 상황의 짧은 인사를 차례로 보여줍니다. */
export const useHeroConversation = () => {
  const [conversationIndex, setConversationIndex] = useState(-1)
  const conversation = conversations[Math.max(0, conversationIndex)]

  /** 첫 답장을 표시한 뒤 누를 때마다 다음 대화로 넘어가며 마지막에서는 처음으로 순환합니다. */
  const advanceConversation = () =>
    setConversationIndex((previous) => (previous + 1) % conversations.length)

  return { ...conversation, hasAnswered: conversationIndex >= 0, advanceConversation }
}
