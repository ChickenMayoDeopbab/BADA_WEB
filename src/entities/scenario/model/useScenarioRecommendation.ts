import { getScenarioRecommendation } from '../api/scenarioApi'
import { useQuery } from '@tanstack/react-query'

const scenarioKeys = {
  recommendation: ['scenario', 'recommendation'] as const,
}

/** 오늘의 추천 시나리오를 조회합니다. */
export const useScenarioRecommendation = () =>
  useQuery({
    queryKey: scenarioKeys.recommendation,
    queryFn: getScenarioRecommendation,
  })
