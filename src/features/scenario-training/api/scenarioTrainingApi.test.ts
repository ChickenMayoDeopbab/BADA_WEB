import { getRingtoneSetting } from '@entities/ringtone'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { aiHttpClient, httpClient } from '@shared/api'
import {
  acceptTrainingCallSchedule,
  cancelTrainingCallSchedule,
  copySharedScenario,
  createCustomScenario,
  createTrainingCallSchedule,
  createTrainingSession,
  deleteCustomScenario,
  getRecommendedScenario,
  getRingingTrainingCallSchedule,
  getScenarioExample,
  getScenarioFeedback,
  getScenarios,
  postTrainingAnxietyScore,
} from './scenarioTrainingApi'

vi.mock('@shared/api', () => ({
  aiHttpClient: { get: vi.fn(), post: vi.fn(), delete: vi.fn() },
  httpClient: { get: vi.fn(), post: vi.fn(), delete: vi.fn() },
}))

const scenario = {
  scenario_id: 12,
  title: '예약 변경',
  content: '예약 날짜를 변경합니다.',
  category: 'daily',
  difficulties: ['low', 'medium', 'high'],
  personalities: ['KIND', 'NORMAL'],
  scenario_image: 'https://media.example.test/scenario.png',
  is_custom: true,
  is_copied: true,
  practice_count: 3,
}
const schedule = { scheduleId: 5, scheduledAt: '2026-10-14T14:00:00+09:00', status: 'SCHEDULED' }

describe('pasted OpenAPI scenario training contracts', () => {
  beforeEach(() => vi.resetAllMocks())

  it('preserves backend scenario images and copied/custom classification with category queries', async () => {
    vi.mocked(aiHttpClient.get).mockResolvedValue({ data: { scenarios: [scenario] } })
    expect(await getScenarios('daily')).toEqual([
      expect.objectContaining({
        scenarioId: 12,
        imageUrl: scenario.scenario_image,
        isCustom: true,
        isCopied: true,
        practiceCount: 3,
      }),
    ])
    expect(aiHttpClient.get).toHaveBeenCalledWith('/api/v1/scenario/scenarios', {
      params: { category: 'daily' },
    })
  })

  it('keeps recommendation reason and the separately provided category icon', async () => {
    vi.mocked(aiHttpClient.get).mockResolvedValue({
      data: {
        scenario,
        reason: 'CUSTOM_NOT_PRACTICED',
        category_icon_url: 'https://media.example.test/category.png',
      },
    })
    expect(await getRecommendedScenario()).toMatchObject({
      reason: 'CUSTOM_NOT_PRACTICED',
      categoryIconUrl: 'https://media.example.test/category.png',
      scenario: { isCustom: true },
    })
  })

  it('keeps both example dialogue and generated TTS URL', async () => {
    const dialogue = [{ speaker: 'ai', text: '안녕하세요.' }]
    vi.mocked(aiHttpClient.get).mockResolvedValue({
      data: { scenario_id: 12, dialogue, audio_url: 'https://media.example.test/example.mp3' },
    })
    expect(await getScenarioExample(12)).toEqual({
      dialogue,
      audioUrl: 'https://media.example.test/example.mp3',
    })
    expect(aiHttpClient.get).toHaveBeenCalledWith('/api/v1/scenario/12/example', {
      timeout: 120000,
    })
  })

  it('posts snake_case custom fields, defaults and returns a custom scenario without creating a session', async () => {
    vi.mocked(aiHttpClient.post).mockResolvedValue({
      data: {
        scenario: {
          scenario_id: 13,
          title: '내 예약',
          content: '전화 예약입니다.',
          ai_prompt: 'internal',
          tts_voice_id: null,
          script: [],
        },
        created_at: '2026-10-14',
      },
    })
    expect(
      await createCustomScenario({
        title: ' 내 예약 ',
        category: 'daily',
        callTarget: ' 식당 직원 ',
        callPurpose: ' 저녁 예약하기 ',
      }),
    ).toMatchObject({ scenarioId: 13, category: 'daily', isCustom: true, isCopied: false })
    expect(aiHttpClient.post).toHaveBeenCalledWith(
      '/api/v1/scenario/custom',
      {
        title: '내 예약',
        category: 'daily',
        call_target: '식당 직원',
        call_purpose: '저녁 예약하기',
        personality: 'NORMAL',
        difficulty: 'medium',
        is_warmup: false,
      },
      { timeout: 120000 },
    )
    expect(httpClient.post).not.toHaveBeenCalled()
  })

  it('retains idempotent copy results from an attached community scenario', async () => {
    vi.mocked(aiHttpClient.post).mockResolvedValue({
      data: { scenario_id: 14, title: '공유 예약', category: 'daily', already_copied: true },
    })
    expect(await copySharedScenario(40)).toEqual({
      scenarioId: 14,
      title: '공유 예약',
      category: 'daily',
      isAlreadyCopied: true,
    })
    expect(aiHttpClient.post).toHaveBeenCalledWith('/api/v1/community/posts/40/scenario/copy')
  })

  it('deletes a custom scenario using its own API', async () => {
    await deleteCustomScenario(13)
    expect(aiHttpClient.delete).toHaveBeenCalledWith('/api/v1/scenario/custom/13')
  })

  it('posts the selected difficulty and optional duration to Spring session creation', async () => {
    const request = {
      scenarioId: 12,
      type: 'CUSTOM' as const,
      difficulty: 'high' as const,
      aiPersonality: 'TOUGH' as const,
      maxDurationSeconds: 120,
    }
    vi.mocked(httpClient.post).mockResolvedValue({
      data: { data: { sessionId: 'session', wsUrl: 'wss://ai.example.test/ws/voice/session' } },
    })
    expect(await createTrainingSession(request)).toMatchObject({ sessionId: 'session' })
    expect(httpClient.post).toHaveBeenCalledWith('/api/v1/session', request, { signal: undefined })
  })

  it('uses the server delay range and unwraps schedule creation and ringing, including no ringing call', async () => {
    const request = {
      scenarioId: 12,
      type: 'CUSTOM' as const,
      aiPersonality: 'KIND' as const,
      minDelayMinutes: 2,
      maxDelayMinutes: 4,
    }
    vi.mocked(httpClient.post).mockResolvedValue({ data: { data: schedule } })
    expect(await createTrainingCallSchedule(request)).toEqual(schedule)
    expect(httpClient.post).toHaveBeenCalledWith('/api/v1/training-call-schedules', request)
    const signal = new AbortController().signal
    vi.mocked(httpClient.get)
      .mockResolvedValueOnce({ data: { data: { ...schedule, status: 'RINGING' } } })
      .mockResolvedValueOnce({ data: { data: null } })
    expect(await getRingingTrainingCallSchedule(signal)).toMatchObject({ status: 'RINGING' })
    expect(httpClient.get).toHaveBeenCalledWith('/api/v1/training-call-schedules/ringing', {
      signal,
    })
    expect(await getRingingTrainingCallSchedule()).toBeNull()
  })

  it('uses the accepted server session and handles cancellation response', async () => {
    vi.mocked(httpClient.post).mockResolvedValue({
      data: {
        data: {
          scheduleId: 5,
          status: 'ACCEPTED',
          sessionId: 'accepted',
          wsUrl: 'wss://ai.example.test/ws/voice/accepted',
        },
      },
    })
    expect(await acceptTrainingCallSchedule(5)).toMatchObject({
      sessionId: 'accepted',
      status: 'ACCEPTED',
    })
    expect(httpClient.post).toHaveBeenCalledWith('/api/v1/training-call-schedules/5/accept')
    vi.mocked(httpClient.delete).mockResolvedValue({
      data: { data: { ...schedule, status: 'CANCELED' } },
    })
    expect(await cancelTrainingCallSchedule(5)).toMatchObject({ status: 'CANCELED' })
  })

  it('normalizes Spring NON_NULL serialization when there is no ringing reservation', async () => {
    vi.mocked(httpClient.get).mockResolvedValue({ data: { status: 200 } })
    expect(await getRingingTrainingCallSchedule()).toBeNull()
  })

  it('reads unwrapped feedback and wrapped ringtone/score responses without confusing the servers', async () => {
    const feedback = {
      sessionType: 'CUSTOM',
      scenarioName: '내 예약',
      trainingTime: '00:01:00',
      goodSegments: [{ start: 1, end: 4, good_point: '용건을 잘 말했어요.' }],
      transcript: [],
      recordingUrl: null,
    }
    vi.mocked(httpClient.get)
      .mockResolvedValueOnce({ data: feedback })
      .mockResolvedValueOnce({ data: { data: { defaultRingtone: true, url: null } } })
    expect(await getScenarioFeedback(12)).toEqual(feedback)
    expect(httpClient.get).toHaveBeenCalledWith('/api/v1/training-records/feedback', {
      params: { scenarioId: 12 },
    })
    expect(await getRingtoneSetting()).toEqual({ defaultRingtone: true, url: null })
    vi.mocked(httpClient.post).mockResolvedValue({
      data: {
        data: {
          recordId: 8,
          sessionId: 'session',
          anxietyScore: 4,
          scoreApplied: false,
          scoreExclusionReason: 'MISSING_ANALYSIS',
        },
      },
    })
    expect(await postTrainingAnxietyScore('session', 4)).toMatchObject({
      scoreApplied: false,
      anxietyScore: 4,
    })
  })
})
