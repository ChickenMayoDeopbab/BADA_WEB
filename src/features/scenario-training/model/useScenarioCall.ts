import { VoiceCall, type VoiceCallState } from './voiceCall'
import { useIncomingRingtone } from './useIncomingRingtone'
import {
  createTrainingSession,
  getRingingTrainingCallSchedule,
  acceptTrainingCallSchedule,
  cancelTrainingCallSchedule,
} from '../api/scenarioTrainingApi'
import { getApiErrorMessage } from '@shared/api'
import type { ScenarioRouteState } from '@entities/scenario'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useEffect, useRef, useState } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'

export interface ScenarioCallOptions {
  getToken: (shouldRefresh?: boolean) => Promise<string>
}

/** 기존 수신·명상 UI에 실제 통화 제어기의 상태와 명령을 연결합니다. */
export const useScenarioCall = ({ getToken }: ScenarioCallOptions) => {
  const navigate = useNavigate()
  const location = useLocation()
  const queryClient = useQueryClient()
  const { scenarioId = '' } = useParams()
  const routeState = location.state as ScenarioRouteState | null
  const serverSchedule = routeState?.schedule
  const [initialDelay] = useState(() => {
    const delay = serverSchedule?.scheduledAt
      ? Math.ceil((Date.parse(serverSchedule.scheduledAt) - Date.now()) / 1000)
      : (routeState?.callDelaySeconds ?? 0)
    return Number.isFinite(delay) ? Math.max(0, delay) : 0
  })
  const [remainingDelay, setRemainingDelay] = useState(initialDelay)
  const [preparationStage, setPreparationStage] = useState<
    'scheduled' | 'incoming' | 'meditationPrompt' | 'meditationVideo'
  >(
    routeState?.isAnswered && routeState.session?.sessionId
      ? 'meditationPrompt'
      : serverSchedule?.status === 'SCHEDULED' || initialDelay > 0
        ? 'scheduled'
        : 'incoming',
  )
  const [voiceState, setVoiceState] = useState<VoiceCallState | null>(null)
  const [session, setSession] = useState(routeState?.session)
  const [sessionErrorMessage, setSessionErrorMessage] = useState('')
  const [elapsedSeconds, setElapsedSeconds] = useState(0)
  const [isScriptOpen, setIsScriptOpen] = useState(false)
  const callRef = useRef<VoiceCall | null>(null)
  const baseStage = sessionErrorMessage ? 'error' : (voiceState?.stage ?? preparationStage)
  const sessionId = session?.sessionId
  const ringingQuery = useQuery({
    queryKey: ['training-call-ringing'],
    queryFn: ({ signal }) => getRingingTrainingCallSchedule(signal),
    enabled: Boolean(serverSchedule && preparationStage === 'scheduled'),
    refetchInterval: 2000,
    retry: false,
    refetchOnMount: 'always',
  })
  const acceptMutation = useMutation({
    mutationFn: acceptTrainingCallSchedule,
    onSuccess: (accepted) => {
      if (accepted.status !== 'ACCEPTED' || !accepted.sessionId || !accepted.wsUrl) {
        setSessionErrorMessage('통화 세션을 받지 못했어요. 새 훈련을 시작해 주세요.')
        return
      }
      const nextSession = { sessionId: accepted.sessionId, wsUrl: accepted.wsUrl }
      setSession(nextSession)
      setPreparationStage('meditationPrompt')
      navigate(location.pathname, {
        replace: true,
        state: { ...routeState, schedule: accepted, session: nextSession, isAnswered: true },
      })
      void queryClient.invalidateQueries({ queryKey: ['training-call-ringing'] })
    },
    onError: (error) =>
      setSessionErrorMessage(getApiErrorMessage(error, '예약 전화를 수락하지 못했어요.')),
  })
  const cancelMutation = useMutation({ mutationFn: cancelTrainingCallSchedule })
  const stage =
    baseStage === 'scheduled' &&
    serverSchedule &&
    ringingQuery.data?.scheduleId === serverSchedule.scheduleId &&
    ringingQuery.data.status === 'RINGING'
      ? 'incoming'
      : baseStage
  const ringtone = useIncomingRingtone(
    stage === 'incoming' && !acceptMutation.isPending && !cancelMutation.isPending,
  )

  useEffect(() => {
    if (preparationStage !== 'scheduled') return
    const scheduledAt = Date.now() + initialDelay * 1000
    const controller = new AbortController()
    /** 앱과 동일하게 발신 직전에 세션을 만들어 예약 중 만료를 방지합니다. */
    const prepareScheduledSession = async () => {
      if (sessionId) {
        setPreparationStage('incoming')
        return
      }
      if (!routeState?.sessionConfiguration) return
      try {
        const nextSession = await createTrainingSession(
          routeState.sessionConfiguration,
          controller.signal,
        )
        if (controller.signal.aborted) return
        setSession(nextSession)
        setPreparationStage('incoming')
      } catch (error) {
        if (!controller.signal.aborted)
          setSessionErrorMessage(
            getApiErrorMessage(error, '통화 세션을 준비하지 못했어요. 새 훈련을 시작해 주세요.'),
          )
      }
    }
    const timer = window.setInterval(() => {
      const remaining = Math.max(0, Math.ceil((scheduledAt - Date.now()) / 1000))
      setRemainingDelay(remaining)
      if (remaining === 0) {
        window.clearInterval(timer)
        if (!serverSchedule) void prepareScheduledSession()
      }
    }, 250)
    return () => {
      window.clearInterval(timer)
      controller.abort()
    }
  }, [initialDelay, preparationStage, routeState?.sessionConfiguration, sessionId, serverSchedule])

  useEffect(() => {
    if (stage !== 'active' || voiceState?.startedAt == null) return
    const startedAt = voiceState.startedAt
    const timer = window.setInterval(
      () => setElapsedSeconds(Math.max(0, Math.floor((Date.now() - startedAt) / 1000))),
      250,
    )
    return () => window.clearInterval(timer)
  }, [stage, voiceState?.startedAt])

  useEffect(() => {
    if (stage !== 'ended') return
    const timer = window.setTimeout(() => {
      if (voiceState?.startedAt == null) {
        navigate('/training', { replace: true })
        return
      }
      void queryClient.invalidateQueries({ queryKey: ['training-records'] })
      navigate(`/training/${scenarioId}/result`, {
        state: {
          ...routeState,
          session,
          callDurationSeconds: voiceState?.durationSeconds ?? 0,
          endReason: voiceState?.endReason,
        },
        replace: true,
      })
    }, 2000)
    return () => window.clearTimeout(timer)
  }, [
    navigate,
    queryClient,
    routeState,
    scenarioId,
    stage,
    voiceState?.durationSeconds,
    voiceState?.endReason,
    voiceState?.startedAt,
    session,
  ])

  useEffect(() => {
    /** 페이지 종료와 브라우저 뒤로 이동 캐시에서도 마이크와 연결을 정리합니다. */
    const handlePageHide = () => {
      callRef.current?.dispose()
      callRef.current = null
      setVoiceState((current) =>
        current && !['ended', 'error'].includes(current.stage)
          ? {
              ...current,
              stage: 'error',
              connection: 'closed',
              errorMessage: '페이지를 벗어나 통화가 종료되었어요. 새 훈련을 시작해 주세요.',
            }
          : current,
      )
    }
    window.addEventListener('pagehide', handlePageHide)
    return () => {
      window.removeEventListener('pagehide', handlePageHide)
      callRef.current?.dispose()
      callRef.current = null
    }
  }, [])

  /** 수신 화면에서 기존 명상 안내를 엽니다. */
  const handleAnswer = () => {
    if (acceptMutation.isPending) return
    if (serverSchedule && !sessionId) acceptMutation.mutate(serverSchedule.scheduleId)
    else setPreparationStage('meditationPrompt')
  }
  /** 명상 화면을 표시합니다. */
  const handleMeditate = () => setPreparationStage('meditationVideo')
  /** 사용자 제스처 안에서 통화 제어기를 한 번만 생성합니다. */
  const handleStartCall = () => {
    if (callRef.current || !sessionId) return
    const call = new VoiceCall({ sessionId, getToken, onState: setVoiceState })
    callRef.current = call
    void call.start()
  }
  /** 사용자 음소거를 실제 마이크와 서버에 반영합니다. */
  const handleToggleMute = () => callRef.current?.toggleMute()
  /** 실시간 스크립트 표시만 전환합니다. */
  const handleToggleScript = () => setIsScriptOpen((isOpen) => !isOpen)
  /** 통화가 종료되면 서버 확인을 받은 뒤 결과 화면으로 이동합니다. */
  const handleEndCall = () => {
    setIsScriptOpen(false)
    callRef.current?.end()
  }
  /** 수신 거절 또는 오류 복귀 시 현재 통화를 정리하고 목록을 엽니다. */
  const handleDecline = async () => {
    if (cancelMutation.isPending) return
    callRef.current?.dispose()
    if (serverSchedule && !sessionId) {
      try {
        await cancelMutation.mutateAsync(serverSchedule.scheduleId)
        await queryClient.invalidateQueries({ queryKey: ['training-call-ringing'] })
      } catch (error) {
        setSessionErrorMessage(
          getApiErrorMessage(error, '예약을 취소하지 못했어요. 다시 시도해 주세요.'),
        )
        return
      }
    }
    navigate('/training')
  }
  /** 실패한 세션을 재사용하지 않고 설정 화면에서 새 세션을 만들도록 안내합니다. */
  const handleRetry = async () => {
    if (cancelMutation.isPending) return
    callRef.current?.dispose()
    if (serverSchedule && !sessionId) {
      try {
        await cancelMutation.mutateAsync(serverSchedule.scheduleId)
        await queryClient.invalidateQueries({ queryKey: ['training-call-ringing'] })
      } catch (error) {
        setSessionErrorMessage(
          getApiErrorMessage(error, '이전 예약을 취소하지 못했어요. 다시 시도해 주세요.'),
        )
        return
      }
    }
    if (!Number.isSafeInteger(Number(scenarioId))) {
      navigate('/training', { replace: true })
      return
    }
    navigate(`/training/${scenarioId}/settings`, {
      state: { scenario: routeState?.scenario },
      replace: true,
    })
  }
  /** 브라우저에서 정지한 오디오를 클릭으로 재개합니다. */
  const handleResumeAudio = () => {
    void callRef.current?.resumeAudio()
  }

  return {
    ...routeState,
    ...ringtone,
    session,
    stage: ringingQuery.isError && preparationStage === 'scheduled' ? 'error' : stage,
    isAccepting: acceptMutation.isPending,
    isCanceling: cancelMutation.isPending,
    remainingDelay,
    elapsedSeconds: ['ending', 'ended', 'error'].includes(stage)
      ? (voiceState?.durationSeconds ?? 0)
      : elapsedSeconds,
    isMuted: voiceState?.isMuted ?? false,
    isSpeakerOn: false,
    isRecording: false,
    isScriptOpen,
    script: voiceState?.transcript.map((turn) => ({ speaker: turn.role, text: turn.text })) ?? [],
    scriptHint: voiceState?.scriptHint ?? null,
    displayName: voiceState?.displayName ?? '',
    connection: voiceState?.connection ?? 'idle',
    isPlaybackBlocked: voiceState?.isPlaybackBlocked ?? false,
    isAudioSuspended: voiceState?.isAudioSuspended ?? false,
    notice: voiceState?.notice ?? '',
    errorMessage:
      sessionErrorMessage ||
      voiceState?.errorMessage ||
      (ringingQuery.isError
        ? getApiErrorMessage(ringingQuery.error, '예약 전화 상태를 확인하지 못했어요.')
        : ''),
    hasSession: Boolean(
      sessionId ||
      serverSchedule ||
      (routeState?.sessionConfiguration && preparationStage === 'scheduled'),
    ),
    handleToggleMute,
    handleToggleScript,
    handleAnswer,
    handleMeditate,
    handleStartCall,
    handleEndCall,
    handleDecline,
    handleRetry,
    handleResumeAudio,
  }
}
