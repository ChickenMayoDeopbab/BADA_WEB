import { hasMatchingCallScenario } from './callRouting'
import { useRouteLifetime } from './useRouteLifetime'
import { postTrainingAnxietyScore } from '../api/scenarioTrainingApi'
import { getApiErrorMessage } from '@shared/api'
import type { ScenarioRouteState } from '@entities/scenario'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useEffect, useState } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'

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
  const isCurrent = useRouteLifetime()
  const queryClient = useQueryClient()
  const location = useLocation()
  const routeState = location.state as ScenarioRouteState | null
  const { scenarioId = '' } = useParams()
  const hasResult =
    Boolean(routeState?.session?.sessionId) && hasMatchingCallScenario(scenarioId, routeState)
  useEffect(() => {
    if (!hasResult) navigate('/training', { replace: true })
  }, [hasResult, navigate])
  const canRecordScore =
    hasResult &&
    (!routeState?.endReason ||
      ['SCENARIO_DONE', 'USER_END', 'END_CALL', 'TIMEOUT'].includes(routeState.endReason))
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

  /** 기록이 준비되지 않았거나 저장에 실패하면 재시도할 수 있도록 화면을 유지합니다. */
  const handleSubmit = async () => {
    if (!hasResult || mutation.isPending) return
    const sessionId = canRecordScore ? routeState?.session?.sessionId : undefined
    if (sessionId) {
      try {
        await mutation.mutateAsync({ sessionId, nextScore: score })
      } catch {
        return
      }
    }
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ['training-records'] }),
      queryClient.invalidateQueries({ queryKey: ['scenarios'] }),
      queryClient.invalidateQueries({ queryKey: ['scenario-recommendation'] }),
      queryClient.invalidateQueries({ queryKey: ['scenario-feedback'] }),
    ])
    if (isCurrent()) navigate('/records', { replace: true })
  }

  return {
    scenario: routeState?.scenario,
    canRecordScore,
    isScoreVisible,
    messageIndex,
    message,
    typedText: isScoreVisible ? message.text : message.text.slice(0, typedLength),
    score,
    isSubmitting: mutation.isPending,
    errorMessage: mutation.isError
      ? getApiErrorMessage(
          mutation.error,
          '불안 점수를 저장하지 못했어요. 잠시 후 다시 시도해 주세요.',
        )
      : '',
    setScore,
    handleShowScore,
    handleSubmit,
  }
}
