import { getDiagnosisQuestions, submitDiagnosis } from './diagnosisApi'
import { httpClient, plainHttpClient } from '@shared/api'
import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('@shared/api', () => ({
  httpClient: {
    get: vi.fn(),
    post: vi.fn(),
  },
  plainHttpClient: { get: vi.fn(), post: vi.fn() },
}))

describe('diagnosisApi', () => {
  beforeEach(() => {
    vi.mocked(httpClient.get).mockReset()
    vi.mocked(httpClient.post).mockReset()
    vi.mocked(plainHttpClient.get).mockReset()
    vi.mocked(plainHttpClient.post).mockReset()
  })

  it('유형별 문항 목록을 조회한다', async () => {
    const questions = [{ questionId: 1, content: '문항', orderIndex: 1 }]
    vi.mocked(httpClient.get).mockResolvedValue({ data: { data: questions } })

    await expect(getDiagnosisQuestions('SIGNUP')).resolves.toEqual(questions)
    expect(httpClient.get).toHaveBeenCalledWith('/api/diagnosis/questions', {
      params: { type: 'SIGNUP' },
    })
  })

  it('공개 진단은 인증 인터셉터가 없는 공통 클라이언트로 조회·제출한다', async () => {
    const questions = [
      { questionId: 11, content: '문항', orderIndex: 1, questionnaireVersion: 'LANDING-v1' },
    ]
    vi.mocked(plainHttpClient.get).mockResolvedValue({ data: { data: questions } })
    await expect(getDiagnosisQuestions('LANDING')).resolves.toEqual(questions)
    expect(plainHttpClient.get).toHaveBeenCalledWith('/api/diagnosis/questions', {
      params: { type: 'LANDING' },
    })
    const request = {
      sessionId: 'public-session',
      type: 'LANDING' as const,
      answers: [3] as const,
      questionnaireVersion: 'LANDING-v1',
    }
    vi.mocked(plainHttpClient.post).mockResolvedValue({ data: { data: { score: 3 } } })
    await submitDiagnosis({ ...request, answers: [...request.answers] })
    expect(plainHttpClient.post).toHaveBeenCalledWith('/api/diagnosis/submit', request)
    expect(httpClient.get).not.toHaveBeenCalled()
    expect(httpClient.post).not.toHaveBeenCalled()
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
