export type ScenarioRecommendationReason =
  'CUSTOM_NOT_PRACTICED' | 'NOT_PRACTICED' | 'LONGEST_ABSENT'

export interface ScenarioRecommendationResponse {
  scenario: {
    scenario_id: number
    title: string
    content: string
    is_custom: boolean
  }
  reason: ScenarioRecommendationReason
  category_icon_url?: string | null
}

export interface RecommendedScenario {
  scenarioId: number
  title: string
  content: string
  isCustom: boolean
  reason: ScenarioRecommendationReason
}
