import type { RecommendedScenario, ScenarioRecommendationResponse } from '../model/types'
import { aiHttpClient } from '@shared/api'

/** 오늘 연습할 시나리오 하나를 추천받습니다. */
export const getScenarioRecommendation = async (): Promise<RecommendedScenario> => {
  const { data } = await aiHttpClient.get<ScenarioRecommendationResponse>(
    '/api/v1/scenario/recommendation',
  )

  return {
    scenarioId: data.scenario.scenario_id,
    title: data.scenario.title,
    content: data.scenario.content,
    isCustom: data.scenario.is_custom,
    reason: data.reason,
  }
}
