import type {
  Scenario,
  ScenarioCategory,
  ScenarioDifficulty,
  ScenarioExample,
  ScenarioPersonality,
  TrainingSession,
  TrainingSessionConfiguration,
  ScenarioRecommendation,
  ScenarioFeedback,
  TrainingAnxietyScore,
  TrainingCallSchedule,
} from '@entities/scenario'
import type { CreateCustomScenarioRequest, CreateTrainingCallScheduleRequest } from '../model/types'
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
  reason?: ScenarioRecommendation['reason']
  category_icon_url?: string | null
}

interface ScenarioExampleResponse {
  dialogue?: Array<{ speaker: 'ai' | 'user'; text: string }>
  audio_url?: string | null
}

export type CreateTrainingSessionRequest = TrainingSessionConfiguration

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

/** 로그인한 사용자가 이용할 수 있는 시나리오를 카테고리별로 조회합니다. */
export const getScenarios = async (category?: ScenarioCategory) => {
  const { data } = await aiHttpClient.get<ScenarioListResponse>('/api/v1/scenario/scenarios', {
    params: category ? { category } : undefined,
  })

  return data.scenarios.map(mapScenario)
}

/** 사용자에게 추천할 시나리오를 조회합니다. */
export const getRecommendedScenario = async () => {
  const { data } = await aiHttpClient.get<ScenarioRecommendationResponse>(
    '/api/v1/scenario/recommendation',
  )

  return {
    scenario: mapScenario(data.scenario),
    reason: data.reason,
    categoryIconUrl: data.category_icon_url?.trim() || undefined,
  } satisfies ScenarioRecommendation
}

/** 입력된 조건으로 AI 시나리오를 생성하며 훈련 세션은 별도로 생성합니다. */
export const createCustomScenario = async (request: CreateCustomScenarioRequest) => {
  const { data } = await aiHttpClient.post<{
    scenario: Pick<ScenarioResponse, 'scenario_id' | 'title' | 'content'>
  }>(
    '/api/v1/scenario/custom',
    {
      title: request.title.trim(),
      category: request.category,
      call_target: request.callTarget.trim(),
      call_purpose: request.callPurpose.trim(),
      personality: request.personality ?? 'NORMAL',
      difficulty: request.difficulty ?? 'medium',
      is_warmup: false,
    },
    { timeout: 120_000 },
  )
  return mapScenario({ ...data.scenario, category: request.category, is_custom: true })
}

/** 게시글에 첨부된 시나리오를 가져옵니다. 이미 가져온 경우에도 같은 결과를 반환합니다. */
export const copySharedScenario = async (postId: number) => {
  const { data } = await aiHttpClient.post<{
    scenario_id: number
    title: string
    category: ScenarioCategory
    already_copied: boolean
  }>(`/api/v1/community/posts/${postId}/scenario/copy`)
  return {
    scenarioId: data.scenario_id,
    title: data.title,
    category: data.category,
    isAlreadyCopied: data.already_copied,
  }
}

/** 선택한 시나리오의 예시 대화와 음성을 조회합니다. */
export const getScenarioExample = async (scenarioId: number): Promise<ScenarioExample> => {
  const { data } = await aiHttpClient.get<ScenarioExampleResponse>(
    `/api/v1/scenario/${scenarioId}/example`,
    { timeout: 120_000 },
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

/** 로그인한 사용자가 만든 커스텀 시나리오를 삭제합니다. */
export const deleteCustomScenario = async (scenarioId: number) => {
  await aiHttpClient.delete(`/api/v1/scenario/custom/${scenarioId}`)
}

/** 선택한 조건으로 실제 훈련 세션을 생성합니다. */
export const createTrainingSession = async (
  request: CreateTrainingSessionRequest,
  signal?: AbortSignal,
) => {
  const { data } = await httpClient.post<ApiResponse<TrainingSession>>('/api/v1/session', request, {
    signal,
  })

  return data.data
}

/** 통화 직후 사용자가 선택한 불안 점수를 기록합니다. */
export const postTrainingAnxietyScore = async (sessionId: string, score: number) => {
  const { data } = await httpClient.post<ApiResponse<TrainingAnxietyScore>>(
    `/api/v1/training-records/${encodeURIComponent(sessionId)}/anxiety-score`,
    {
      score,
    },
  )
  return data.data
}

/** 시나리오의 최근 훈련 피드백을 조회합니다. 이 API는 Spring 응답 래퍼를 사용하지 않습니다. */
export const getScenarioFeedback = async (scenarioId: number) => {
  const { data } = await httpClient.get<ScenarioFeedback>('/api/v1/training-records/feedback', {
    params: { scenarioId },
  })
  return data
}

/** 서버가 발신 시점을 결정하고 보존하는 예약을 생성합니다. 예약 API는 난이도를 지원하지 않습니다. */
export const createTrainingCallSchedule = async (request: CreateTrainingCallScheduleRequest) => {
  const { data } = await httpClient.post<ApiResponse<TrainingCallSchedule>>(
    '/api/v1/training-call-schedules',
    request,
  )
  return data.data
}

/** 현재 수신 가능한 예약을 조회합니다. 수신 중인 예약이 없으면 null입니다. */
export const getRingingTrainingCallSchedule = async (signal?: AbortSignal) => {
  const { data } = await httpClient.get<ApiResponse<TrainingCallSchedule | null>>(
    '/api/v1/training-call-schedules/ringing',
    { signal },
  )
  // Spring은 NON_NULL 직렬화로 수신 전화가 없을 때 data 필드를 생략합니다.
  return data.data ?? null
}

/** 수신 중인 서버 예약을 수락하고 서버가 생성한 통화 세션을 반환합니다. */
export const acceptTrainingCallSchedule = async (scheduleId: number) => {
  const { data } = await httpClient.post<ApiResponse<TrainingCallSchedule>>(
    `/api/v1/training-call-schedules/${scheduleId}/accept`,
  )
  return data.data
}

/** 대기 또는 수신 중인 예약을 취소합니다. 수락한 예약은 취소할 수 없습니다. */
export const cancelTrainingCallSchedule = async (scheduleId: number) => {
  const { data } = await httpClient.delete<ApiResponse<TrainingCallSchedule>>(
    `/api/v1/training-call-schedules/${scheduleId}`,
  )
  return data.data
}

/** 수신 벨소리의 현재 사용자 설정을 조회합니다. 설정 변경은 프로필 기능에서 처리합니다. */
export const getTrainingRingtone = async () => {
  const { data } = await httpClient.get<
    ApiResponse<{ defaultRingtone: boolean; url?: string | null }>
  >('/api/v1/ringtones/settings')
  return data.data
}
