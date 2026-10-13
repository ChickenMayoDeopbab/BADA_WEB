import { postTrainingAnxietyScore } from '../api/scenarioTrainingApi'
import type { ScenarioRouteState } from '@entities/scenario'
import { useMutation } from '@tanstack/react-query'
import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'

export const trainingResultMessages = [
  { face: 'thinking', text: '이번 전화는 어땠나요?' },
  { face: 'thinking', text: '어때요?\n지난 번보다 괜찮아진 것 같나요?' },
  { face: 'grinning', text: '그렇지 않아도 괜찮아요!' },
  { face: 'grinning', text: '바다와 함께라면\n두려움이 사라질거라 믿어요!' },
  { face: 'winking', text: '자, 이제\n이번 훈련이 어땠는지 알려줄래요?' },
  { face: 'winking', text: '불안 점수를\n1-10 중 하나로 골라주면 돼요!' },
] as const

const messageTypingInterval = 45
const messageHoldDuration = 900
const lastMessageIndex = trainingResultMessages.length - 1

/** 통화 종료 안내와 불안 점수 기록 상태를 관리합니다. */
export const useTrainingResult = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const routeState = location.state as ScenarioRouteState | null
  const [isScoreVisible, setIsScoreVisible] = useState(false)
  const [messageIndex, setMessageIndex] = useState(0)
  const [typedLength, setTypedLength] = useState(0)
  const [score, setScore] = useState(1)
  const message = trainingResultMessages[messageIndex]
  const mutation = useMutation({
    mutationFn: ({ sessionId, nextScore }: { sessionId: string; nextScore: number }) =>
      postTrainingAnxietyScore(sessionId, nextScore),
  })

  useEffect(() => {
    if (isScoreVisible || typedLength >= message.text.length) return
    const timer = window.setTimeout(() => {
      setTypedLength((currentLength) => Math.min(message.text.length, currentLength + 1))
    }, messageTypingInterval)

    return () => window.clearTimeout(timer)
  }, [isScoreVisible, message.text, typedLength])

  useEffect(() => {
    if (isScoreVisible || typedLength < message.text.length) return
    const timer = window.setTimeout(() => {
      if (messageIndex < lastMessageIndex) {
        setTypedLength(0)
        setMessageIndex((currentIndex) => currentIndex + 1)
        return
      }
      setIsScoreVisible(true)
    }, messageHoldDuration)

    return () => window.clearTimeout(timer)
  }, [isScoreVisible, message.text.length, messageIndex, typedLength])

  /** 종료 안내를 건너뛰고 점수 선택 화면을 엽니다. */
  const handleShowScore = () => {
    setMessageIndex(lastMessageIndex)
    setTypedLength(trainingResultMessages[lastMessageIndex].text.length)
    setIsScoreVisible(true)
  }

  /** 불안 점수 기록 성공 여부와 관계없이 기록 화면으로 이동합니다. */
  const handleSubmit = async () => {
    if (mutation.isPending) return
    const sessionId = routeState?.session?.sessionId
    if (sessionId) {
      try {
        await mutation.mutateAsync({ sessionId, nextScore: score })
      } catch {
        // 앱과 동일하게 점수 기록 실패가 다음 화면 이동을 막지 않게 합니다.
      }
    }
    navigate('/records', { replace: true })
  }

  return {
    scenario: routeState?.scenario,
    isScoreVisible,
    messageIndex,
    message,
    typedText: isScoreVisible ? message.text : message.text.slice(0, typedLength),
    score,
    isSubmitting: mutation.isPending,
    setScore,
    handleShowScore,
    handleSubmit,
  }
}
