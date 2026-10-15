import { useRef, useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import type {
  Scenario,
  ScenarioPersonality,
  TrainingSessionConfiguration,
} from '@entities/scenario'
import { getApiErrorMessage } from '@shared/api'
import { createCustomScenario, createTrainingSession } from '../api/scenarioTrainingApi'
import { useRouteLifetime } from './useRouteLifetime'

/** 생성 성공 후 세션만 실패했을 때 동일한 워밍업을 재사용합니다. */
export const useWarmup = () => {
  const [target, setTarget] = useState('')
  const [purpose, setPurpose] = useState('')
  const [personality, setPersonality] = useState<ScenarioPersonality>('KIND')
  const created = useRef<{ key: string; scenario: Scenario } | null>(null)
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const isCurrent = useRouteLifetime()
  const canStart = target.trim().length >= 2 && purpose.trim().length >= 5
  const start = useMutation({
    retry: false,
    mutationFn: async () => {
      const key = JSON.stringify([target.trim(), purpose.trim(), personality])
      const scenario =
        created.current?.key === key
          ? created.current.scenario
          : await createCustomScenario({
              title: `${target.trim()}와의 워밍업`.slice(0, 50),
              category: 'other',
              callTarget: target.trim(),
              callPurpose: purpose.trim(),
              personality,
              difficulty: 'low',
              isWarmup: true,
            })
      created.current = { key, scenario }
      if (!isCurrent()) throw new DOMException('Warm-up cancelled', 'AbortError')
      const sessionConfiguration: TrainingSessionConfiguration = {
        scenarioId: scenario.scenarioId,
        type: 'WARMUP',
        aiPersonality: personality,
        difficulty: 'low',
        maxDurationSeconds: 30,
      }
      const session = await createTrainingSession(sessionConfiguration)
      return { scenario, session, sessionConfiguration }
    },
    onSuccess: (state) => {
      void queryClient.invalidateQueries({ queryKey: ['scenarios'] })
      if (isCurrent())
        navigate(`/training/${state.scenario.scenarioId}/call`, {
          state: { ...state, isAnswered: true },
        })
    },
  })
  return {
    target,
    purpose,
    personality,
    setTarget,
    setPurpose,
    setPersonality,
    canStart,
    isStarting: start.isPending,
    error: start.isError
      ? getApiErrorMessage(start.error, '워밍업을 준비하지 못했어요. 다시 시도해 주세요.')
      : '',
    handleStart: () => {
      if (canStart && !start.isPending) start.mutate()
    },
  }
}
