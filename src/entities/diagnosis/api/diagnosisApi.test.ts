import { getDiagnosisQuestions, submitDiagnosis } from './diagnosisApi'
import { httpClient } from '@shared/api'
import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('@shared/api', () => ({
  httpClient: {
    get: vi.fn(),
    post: vi.fn(),
  },
}))

describe('diagnosisApi', () => {
  beforeEach(() => {
    vi.mocked(httpClient.get).mockReset()
    vi.mocked(httpClient.post).mockReset()
  })

  it('회원 진단 문항을 SIGNUP 유형으로 조회한다', async () => {
    const questions = [{ questionId: 1, content: '문항', orderIndex: 1 }]
    vi.mocked(httpClient.get).mockResolvedValue({ data: { data: questions } })

    await expect(getDiagnosisQuestions()).resolves.toEqual(questions)
    expect(httpClient.get).toHaveBeenCalledWith('/api/diagnosis/questions', {
      params: { type: 'SIGNUP' },
    })
  })

  it('응답을 제출하고 결과를 반환한다', async () => {
    const result = {
      score: 2.4,
      levelName: '전화 마스터',
      levelDescription: '설명',
      summary: '요약',
    }
    const request = { sessionId: 'session', type: 'SIGNUP' as const, answers: [1, 5] as (1 | 5)[] }
    vi.mocked(httpClient.post).mockResolvedValue({ data: { data: result } })

    await expect(submitDiagnosis(request)).resolves.toEqual(result)
    expect(httpClient.post).toHaveBeenCalledWith('/api/diagnosis/submit', request)
  })
})
