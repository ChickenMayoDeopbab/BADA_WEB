import { getScenarioExample } from '../api/scenarioTrainingApi'
import type { ScenarioRouteState } from '@entities/scenario'
import { getApiErrorMessage } from '@shared/api'
import { useQuery } from '@tanstack/react-query'
import { useEffect, useState } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'

export type ScenarioCallStage =
  | 'scheduled'
  | 'incoming'
  | 'meditationPrompt'
  | 'meditationVideo'
  | 'active'
  | 'ended'

/** 시나리오 통화 화면의 발신 대기와 통화 상태를 관리합니다. */
export const useScenarioCall = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { scenarioId = '' } = useParams()
  const routeState = location.state as ScenarioRouteState | null
  const initialDelay = Math.max(0, routeState?.callDelaySeconds ?? 0)
  const [remainingDelay, setRemainingDelay] = useState(initialDelay)
  const [stage, setStage] = useState<ScenarioCallStage>(initialDelay > 0 ? 'scheduled' : 'incoming')
  const [elapsedSeconds, setElapsedSeconds] = useState(0)
  const [isMuted, setIsMuted] = useState(false)
  const [isSpeakerOn] = useState(false)
  const [isRecording] = useState(false)
  const [isScriptOpen, setIsScriptOpen] = useState(false)
  const numericScenarioId = Number(scenarioId)
  const scriptQuery = useQuery({
    queryKey: ['scenario-example', numericScenarioId],
    queryFn: () => getScenarioExample(numericScenarioId),
    enabled: isScriptOpen && Number.isSafeInteger(numericScenarioId) && numericScenarioId > 0,
  })

  useEffect(() => {
    if (stage !== 'scheduled') return
    const timer = window.setInterval(() => {
      setRemainingDelay((currentDelay) => {
        if (currentDelay <= 1) {
          window.clearInterval(timer)
          setStage('incoming')
          return 0
        }
        return currentDelay - 1
      })
    }, 1_000)

    return () => window.clearInterval(timer)
  }, [stage])

  useEffect(() => {
    if (stage !== 'active') return
    const timer = window.setInterval(() => setElapsedSeconds((seconds) => seconds + 1), 1_000)

    return () => window.clearInterval(timer)
  }, [stage])

  useEffect(() => {
    if (stage !== 'ended') return
    const timer = window.setTimeout(() => {
      navigate(`/training/${scenarioId}/result`, { state: routeState, replace: true })
    }, 2_000)

    return () => window.clearTimeout(timer)
  }, [navigate, routeState, scenarioId, stage])

  /** 수신 화면에서 통화를 받고 준비 화면을 엽니다. */
  const handleAnswer = () => setStage('meditationPrompt')

  /** 명상 안내 화면을 표시합니다. */
  const handleMeditate = () => setStage('meditationVideo')

  /** 준비 안내를 닫고 실제 통화 화면을 시작합니다. */
  const handleStartCall = () => setStage('active')

  /** 통화 중 마이크 음소거 상태를 전환합니다. */
  const handleToggleMute = () => setIsMuted((currentMuted) => !currentMuted)

  /** 통화 화면을 유지한 채 스크립트 패널을 열거나 닫습니다. */
  const handleToggleScript = () => setIsScriptOpen((currentOpen) => !currentOpen)

  /** 통화를 종료하고 불안 점수 입력 화면으로 이동합니다. */
  const handleEndCall = () => {
    setIsScriptOpen(false)
    setStage('ended')
  }

  /** 수신 전화를 거절하고 시나리오 목록으로 돌아갑니다. */
  const handleDecline = () => navigate('/training')

  return {
    ...routeState,
    stage,
    remainingDelay,
    elapsedSeconds,
    isMuted,
    isSpeakerOn,
    isRecording,
    isScriptOpen,
    script: scriptQuery.data?.dialogue ?? [],
    isScriptLoading: scriptQuery.isPending && isScriptOpen,
    scriptErrorMessage: scriptQuery.isError
      ? getApiErrorMessage(scriptQuery.error, '예시 스크립트를 불러오지 못했습니다.')
      : '',
    handleToggleMute,
    handleToggleScript,
    handleAnswer,
    handleMeditate,
    handleStartCall,
    handleEndCall,
    handleDecline,
  }
}
