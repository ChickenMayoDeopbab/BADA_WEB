import { getScenarioRecommendation } from './scenarioApi'
import { aiHttpClient } from '@shared/api'
import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('@shared/api', () => ({
  aiHttpClient: {
    get: vi.fn(),
  },
}))

describe('scenarioApi', () => {
  beforeEach(() => {
    vi.mocked(aiHttpClient.get).mockReset()
  })

  it('maps the recommended scenario response to camelCase fields', async () => {
    vi.mocked(aiHttpClient.get).mockResolvedValue({
      data: {
        scenario: {
          scenario_id: 7,
          title: '배준하 라면',
          content: '배준하에게 투움바 라면 사달라고 부탁하기',
          is_custom: true,
        },
        reason: 'CUSTOM_NOT_PRACTICED',
      },
    })

    await expect(getScenarioRecommendation()).resolves.toEqual({
      scenarioId: 7,
      title: '배준하 라면',
      content: '배준하에게 투움바 라면 사달라고 부탁하기',
      isCustom: true,
      reason: 'CUSTOM_NOT_PRACTICED',
    })
    expect(aiHttpClient.get).toHaveBeenCalledWith('/api/v1/scenario/recommendation')
  })
})
