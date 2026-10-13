import { aiHttpClient } from '@shared/api'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  createCustomScenario,
  deleteCustomScenario,
  getRecommendedScenario,
  getScenarioExample,
  getScenarios,
} from './scenarioTrainingApi'

vi.mock('@shared/api', () => ({
  aiHttpClient: {
    get: vi.fn(),
    post: vi.fn(),
    delete: vi.fn(),
  },
  httpClient: {
    post: vi.fn(),
  },
}))

const scenarioResponse = {
  scenario_id: 21,
  title: '음식점 예약',
  content: '음식점에 전화해 자리를 예약해요.',
  category: 'daily' as const,
  difficulties: ['low', 'medium'] as const,
  personalities: ['KIND', 'NORMAL'] as const,
  scenario_image: 'https://example.com/scenario.png',
  is_custom: false,
  is_copied: false,
  practice_count: 3,
}

describe('scenarioTrainingApi', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('선택한 카테고리로 시나리오 목록을 조회하고 화면 데이터로 변환한다', async () => {
    vi.mocked(aiHttpClient.get).mockResolvedValue({
      data: { scenarios: [scenarioResponse] },
    })

    await expect(getScenarios('daily')).resolves.toEqual([
      {
        scenarioId: 21,
        title: '음식점 예약',
        content: '음식점에 전화해 자리를 예약해요.',
        category: 'daily',
        difficulties: ['low', 'medium'],
        personalities: ['KIND', 'NORMAL'],
        imageUrl: 'https://example.com/scenario.png',
        isCustom: false,
        isCopied: false,
        practiceCount: 3,
      },
    ])
    expect(aiHttpClient.get).toHaveBeenCalledWith('/api/v1/scenario/scenarios', {
      params: { category: 'daily' },
    })
  })

  it('추천 시나리오를 조회한다', async () => {
    vi.mocked(aiHttpClient.get).mockResolvedValue({
      data: { scenario: scenarioResponse, reason: 'NOT_PRACTICED' },
    })

    await expect(getRecommendedScenario()).resolves.toMatchObject({ scenarioId: 21 })
    expect(aiHttpClient.get).toHaveBeenCalledWith('/api/v1/scenario/recommendation')
  })

  it('시나리오 예시 대화와 음성 주소를 조회한다', async () => {
    vi.mocked(aiHttpClient.get).mockResolvedValue({
      data: {
        scenario_id: 21,
        dialogue: [{ speaker: 'ai', text: '안녕하세요.' }],
        audio_url: 'https://example.com/example.mp3',
      },
    })

    await expect(getScenarioExample(21)).resolves.toEqual({
      dialogue: [{ speaker: 'ai', text: '안녕하세요.' }],
      audioUrl: 'https://example.com/example.mp3',
    })
    expect(aiHttpClient.get).toHaveBeenCalledWith('/api/v1/scenario/21/example')
  })

  it('입력값을 서버 필드명으로 바꿔 커스텀 시나리오를 생성한다', async () => {
    vi.mocked(aiHttpClient.post).mockResolvedValue({
      data: {
        scenario: {
          scenario_id: 31,
          title: '병원 예약',
          content: '병원 예약을 연습해요.',
          ai_prompt: '예약 직원을 연기한다.',
          tts_voice_id: null,
          script: [],
        },
        created_at: '2026-10-13T00:00:00Z',
      },
    })

    await expect(
      createCustomScenario({
        title: '병원 예약',
        callTarget: '병원 접수 직원',
        callPurpose: '진료 날짜와 시간을 예약하고 싶어요.',
        category: 'daily',
      }),
    ).resolves.toMatchObject({
      scenarioId: 31,
      category: 'daily',
      isCustom: true,
      isCopied: false,
      practiceCount: 0,
    })
    expect(aiHttpClient.post).toHaveBeenCalledWith('/api/v1/scenario/custom', {
      title: '병원 예약',
      call_target: '병원 접수 직원',
      call_purpose: '진료 날짜와 시간을 예약하고 싶어요.',
      category: 'daily',
    })
  })

  it('내 커스텀 시나리오를 삭제한다', async () => {
    vi.mocked(aiHttpClient.delete).mockResolvedValue({ data: undefined })

    await expect(deleteCustomScenario(31)).resolves.toBeUndefined()
    expect(aiHttpClient.delete).toHaveBeenCalledWith('/api/v1/scenario/custom/31')
  })
})
