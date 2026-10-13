import type {
  Scenario,
  ScenarioCategory,
  ScenarioDifficulty,
  ScenarioExample,
  ScenarioPersonality,
  ScenarioSessionType,
  TrainingSession,
} from '@entities/scenario'
import { aiHttpClient, httpClient } from '@shared/api'
import type { ApiResponse } from '@shared/types'

interface ScenarioResponse {
  scenario_id: number
  title: string
  content: string
  category: ScenarioCategory
  difficulties?: ScenarioDifficulty[]
  personalities?: ScenarioPersonality[]
  scenario_image?: string | null
  is_custom?: boolean
  is_copied?: boolean
  practice_count?: number
}

interface ScenarioListResponse {
  scenarios: ScenarioResponse[]
}

interface ScenarioRecommendationResponse {
  scenario: ScenarioResponse
}

interface ScenarioExampleResponse {
  dialogue?: Array<{ speaker: 'ai' | 'user'; text: string }>
  audio_url?: string | null
}

export interface CreateCustomScenarioRequest {
  title: string
  callTarget: string
  callPurpose: string
  category: ScenarioCategory
}

interface CreateCustomScenarioResponse {
  scenario: Omit<ScenarioResponse, 'category'> & { category?: ScenarioCategory }
}

export interface CreateTrainingSessionRequest {
  scenarioId: number
  type: ScenarioSessionType
  aiPersonality: ScenarioPersonality
  difficulty: ScenarioDifficulty
}

/** AI 서버 시나리오 응답을 화면 도메인 형식으로 변환합니다. */
const mapScenario = (scenario: ScenarioResponse): Scenario => ({
  scenarioId: scenario.scenario_id,
  title: scenario.title,
  content: scenario.content,
  category: scenario.category,
  difficulties: scenario.difficulties ?? [],
  personalities: scenario.personalities ?? [],
  imageUrl: scenario.scenario_image?.trim() || undefined,
  isCustom: Boolean(scenario.is_custom),
  isCopied: Boolean(scenario.is_copied),
  practiceCount: scenario.practice_count ?? 0,
})

/** 로그인한 사용자가 이용할 수 있는 전체 시나리오를 조회합니다. */
export const getScenarios = async () => {
  const { data } = await aiHttpClient.get<ScenarioListResponse>('/api/v1/scenario/scenarios')

  return data.scenarios.map(mapScenario)
}

/** 사용자에게 추천할 시나리오를 조회합니다. */
export const getRecommendedScenario = async () => {
  const { data } = await aiHttpClient.get<ScenarioRecommendationResponse>(
    '/api/v1/scenario/recommendation',
  )

  return mapScenario(data.scenario)
}

/** 선택한 시나리오의 예시 대화와 음성을 조회합니다. */
export const getScenarioExample = async (scenarioId: number): Promise<ScenarioExample> => {
  const { data } = await aiHttpClient.get<ScenarioExampleResponse>(
    `/api/v1/scenario/${scenarioId}/example`,
  )

  return {
    dialogue: data.dialogue ?? [],
    audioUrl: data.audio_url?.trim() || undefined,
  }
}

/** 예시 음성 파형 분석에 사용할 원본 바이너리를 인증과 함께 조회합니다. */
export const getScenarioExampleAudioBuffer = async (audioUrl: string, signal: AbortSignal) => {
  try {
    const response = await fetch(audioUrl, { signal })
    if (response.ok) return response.arrayBuffer()
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') throw error
  }

  const { data } = await aiHttpClient.get<ArrayBuffer>(audioUrl, {
    responseType: 'arraybuffer',
    signal,
  })

  return data
}

/** 사용자가 입력한 내용으로 커스텀 시나리오를 생성합니다. */
export const createCustomScenario = async (request: CreateCustomScenarioRequest) => {
  const { data } = await aiHttpClient.post<CreateCustomScenarioResponse>(
    '/api/v1/scenario/custom',
    {
      title: request.title,
      call_target: request.callTarget,
      call_purpose: request.callPurpose,
      category: request.category,
    },
  )

  return mapScenario({
    ...data.scenario,
    category: data.scenario.category ?? request.category,
    is_custom: true,
  })
}

/** 선택한 조건으로 실제 훈련 세션을 생성합니다. */
export const createTrainingSession = async (request: CreateTrainingSessionRequest) => {
  const { data } = await httpClient.post<ApiResponse<TrainingSession>>('/api/v1/session', request)

  return data.data
}

/** 통화 직후 사용자가 선택한 불안 점수를 기록합니다. */
export const postTrainingAnxietyScore = async (sessionId: string, score: number) => {
  await httpClient.post<ApiResponse<null>>(`/api/v1/training-records/${sessionId}/anxiety-score`, {
    score,
  })
}
