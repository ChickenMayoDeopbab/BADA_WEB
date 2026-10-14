import {
  createTrainingSession,
  createTrainingCallSchedule,
  getScenarios,
} from '../api/scenarioTrainingApi'
import type { CreateTrainingCallScheduleRequest } from './types'
import type {
  Scenario,
  ScenarioDifficulty,
  ScenarioPersonality,
  ScenarioRouteState,
  TrainingSessionConfiguration,
} from '@entities/scenario'
import { getApiErrorMessage } from '@shared/api'
import { useMutation, useQuery } from '@tanstack/react-query'
import { useMemo, useState } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'

export type TrainingSettingStep = 'level' | 'time'

/** 시나리오 훈련 조건 선택과 세션 생성을 관리합니다. */
export const useTrainingSettings = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { scenarioId = '' } = useParams()
  const routeState = location.state as ScenarioRouteState | null
  const [step, setStep] = useState<TrainingSettingStep>('level')
  const [difficulty, setDifficulty] = useState<ScenarioDifficulty>('low')
  const [personality, setPersonality] = useState<ScenarioPersonality>('KIND')
  const [delayFrom, setDelayFrom] = useState(0)
  const [delayTo, setDelayTo] = useState(0)
  const [shouldKeepSchedule, setShouldKeepSchedule] = useState(false)
  const scenariosQuery = useQuery({
    queryKey: ['scenarios'],
    queryFn: () => getScenarios(),
    enabled: !routeState?.scenario,
  })
  const scenario = useMemo<Scenario | undefined>(
    () =>
      routeState?.scenario ??
      scenariosQuery.data?.find((item) => String(item.scenarioId) === scenarioId),
    [routeState?.scenario, scenarioId, scenariosQuery.data],
  )

  const sessionMutation = useMutation({
    mutationFn: (request: TrainingSessionConfiguration) => createTrainingSession(request),
    onSuccess: (session) => {
      if (!scenario) return
      navigate(`/training/${scenario.scenarioId}/call`, {
        state: {
          scenario,
          session,
          callDelaySeconds: 0,
        } satisfies ScenarioRouteState,
      })
    },
  })

  const isDelayInvalid = delayFrom > delayTo
  const scheduleMutation = useMutation({
    mutationFn: (request: CreateTrainingCallScheduleRequest) => createTrainingCallSchedule(request),
    onSuccess: (schedule) => {
      if (!scenario) return
      navigate(`/training/${scenario.scenarioId}/call`, {
        state: { scenario, schedule } satisfies ScenarioRouteState,
      })
    },
  })

  /** 첫 단계에서 발신 시간 단계로 진행합니다. */
  const handleNext = () => setStep('time')

  /** 현재 단계에 맞춰 이전 화면으로 이동합니다. */
  const handleBack = () => {
    if (step === 'time') {
      setStep('level')
      return
    }
    navigate(-1)
  }

  /** 선택한 조건으로 서버 훈련 세션을 생성합니다. */
  const handleComplete = () => {
    if (!scenario || isDelayInvalid || sessionMutation.isPending || scheduleMutation.isPending)
      return

    const sessionConfiguration: TrainingSessionConfiguration = {
      scenarioId: scenario.scenarioId,
      type: scenario.isCustom ? 'CUSTOM' : 'SCENARIO',
      difficulty,
      aiPersonality: personality,
    }
    if (shouldKeepSchedule && delayTo > 0) {
      scheduleMutation.mutate({
        scenarioId: scenario.scenarioId,
        type: sessionConfiguration.type,
        aiPersonality: personality,
        minDelayMinutes: delayFrom,
        maxDelayMinutes: delayTo,
      })
      return
    }
    const delayMinutes = delayFrom + Math.random() * (delayTo - delayFrom)
    const callDelaySeconds = Math.round(delayMinutes * 60)
    if (callDelaySeconds > 0) {
      navigate(`/training/${scenario.scenarioId}/call`, {
        state: { scenario, sessionConfiguration, callDelaySeconds } satisfies ScenarioRouteState,
      })
      return
    }
    sessionMutation.mutate(sessionConfiguration)
  }

  return {
    step,
    scenario,
    difficulty,
    personality,
    delayFrom,
    delayTo,
    isLoading: scenariosQuery.isPending && !routeState?.scenario,
    shouldKeepSchedule,
    setShouldKeepSchedule,
    isCreatingSession: sessionMutation.isPending || scheduleMutation.isPending,
    isDelayInvalid,
    errorMessage:
      sessionMutation.isError || scheduleMutation.isError
        ? getApiErrorMessage(
            sessionMutation.error ?? scheduleMutation.error,
            '훈련을 준비하지 못했습니다.',
          )
        : scenariosQuery.isError
          ? getApiErrorMessage(scenariosQuery.error, '시나리오를 불러오지 못했습니다.')
          : '',
    setDifficulty,
    setPersonality,
    setDelayFrom,
    setDelayTo,
    handleNext,
    handleBack,
    handleComplete,
  }
}
