import { RESULT_TRANSITION_DELAY_MS, useSelfDiagnosis } from './useSelfDiagnosis'
import { getDiagnosisQuestions, submitDiagnosis } from '@entities/diagnosis'
import { acceptLegalConsents, getLegalConsentStatus } from '@entities/legal-consent'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { act, renderHook, waitFor } from '@testing-library/react'
import { createElement, type ReactNode } from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const navigate = vi.fn()

vi.mock('react-router-dom', () => ({ useNavigate: () => navigate }))
vi.mock('@shared/api', () => ({
  getApiErrorMessage: (_error: unknown, fallback: string) => fallback,
}))
vi.mock('@shared/config', () => ({ routePaths: { dashboard: '/dashboard' } }))
vi.mock('@entities/diagnosis', () => ({
  getDiagnosisQuestions: vi.fn(),
  submitDiagnosis: vi.fn(),
}))
vi.mock('@entities/legal-consent', () => ({
  getLegalConsentStatus: vi.fn(),
  acceptLegalConsents: vi.fn(),
}))

const consentStatus = {
  termsOfServiceAgreed: true,
  privacyPolicyAcknowledged: true,
  sensitiveInformationAgreed: true,
  profileImageAgreed: true,
  legalActionRequired: false,
}
const questions = [
  { questionId: 12, content: '두 번째 문항', orderIndex: 2 },
  { questionId: 11, content: '첫 번째 문항', orderIndex: 1 },
]
const result = { score: 4, levelName: '전화 마스터', levelDescription: '설명', summary: '요약' }

const wrapper = ({ children }: { children: ReactNode }) =>
  createElement(
    QueryClientProvider,
    { client: new QueryClient({ defaultOptions: { queries: { retry: false } } }) },
    children,
  )

// 동의된 사용자로 문항 화면까지 진입합니다.
const renderStartedDiagnosis = async () => {
  const rendered = renderHook(() => useSelfDiagnosis(), { wrapper })
  await waitFor(() => expect(rendered.result.current.questionsStatus).toBe('success'))
  await act(() => rendered.result.current.start())
  return rendered
}

describe('useSelfDiagnosis', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(getDiagnosisQuestions).mockResolvedValue(questions)
    vi.mocked(getLegalConsentStatus).mockResolvedValue(consentStatus)
    vi.stubGlobal('crypto', { randomUUID: () => 'session-1' })
  })

  afterEach(() => {
    vi.useRealTimers()
    vi.unstubAllGlobals()
  })

  it('민감정보에 동의한 사용자는 바로 첫 문항을 본다', async () => {
    const { result: hook } = await renderStartedDiagnosis()

    expect(hook.current.step).toBe('question')
    expect(hook.current.currentQuestion?.content).toBe('첫 번째 문항')
    expect(hook.current.totalCount).toBe(2)
  })

  it('응답을 고르기 전에는 다음 문항으로 넘어가지 않는다', async () => {
    const { result: hook } = await renderStartedDiagnosis()

    act(() => hook.current.goNext())
    expect(hook.current.currentIndex).toBe(0)

    act(() => hook.current.selectAnswer(5))
    act(() => hook.current.goNext())
    expect(hook.current.currentIndex).toBe(1)
  })

  it('뒤로 가면 이전 응답을 유지하고, 첫 문항에서는 시작 화면으로 돌아간다', async () => {
    const { result: hook } = await renderStartedDiagnosis()

    act(() => hook.current.selectAnswer(2))
    act(() => hook.current.goNext())
    act(() => hook.current.goBack())
    expect(hook.current.currentAnswer).toBe(2)

    act(() => hook.current.goBack())
    expect(hook.current.step).toBe('intro')
  })

  it('마지막 문항에서 응답을 제출하고 완료 화면 뒤 결과를 보여준다', async () => {
    vi.mocked(submitDiagnosis).mockResolvedValue(result)
    const { result: hook } = await renderStartedDiagnosis()
    vi.useFakeTimers()

    act(() => hook.current.selectAnswer(1))
    act(() => hook.current.goNext())
    act(() => hook.current.selectAnswer(5))
    await act(async () => hook.current.goNext())

    expect(submitDiagnosis).toHaveBeenCalledWith({
      sessionId: 'session-1',
      type: 'SIGNUP',
      answers: [1, 5],
    })
    expect(hook.current.step).toBe('done')

    act(() => vi.advanceTimersByTime(RESULT_TRANSITION_DELAY_MS))
    expect(hook.current.step).toBe('result')
    expect(hook.current.result).toEqual(result)
  })

  it('제출에 실패하면 같은 sessionId로 다시 제출할 수 있다', async () => {
    vi.mocked(submitDiagnosis).mockRejectedValueOnce(new Error('fail')).mockResolvedValue(result)
    const { result: hook } = await renderStartedDiagnosis()

    act(() => hook.current.selectAnswer(3))
    act(() => hook.current.goNext())
    act(() => hook.current.selectAnswer(4))
    await act(async () => hook.current.goNext())
    expect(hook.current.step).toBe('error')

    await act(async () => hook.current.retrySubmit())
    expect(submitDiagnosis).toHaveBeenLastCalledWith({
      sessionId: 'session-1',
      type: 'SIGNUP',
      answers: [3, 4],
    })
    expect(hook.current.step).toBe('done')
  })

  it('민감정보에 동의하지 않았으면 동의를 받은 뒤 진단을 시작한다', async () => {
    vi.mocked(getLegalConsentStatus).mockResolvedValue({
      ...consentStatus,
      sensitiveInformationAgreed: false,
      profileImageAgreed: false,
    })
    vi.mocked(acceptLegalConsents).mockResolvedValue(consentStatus)
    const { result: hook } = await renderStartedDiagnosis()

    expect(hook.current.step).toBe('intro')
    expect(hook.current.consentStatus).toBe('required')

    await act(() => hook.current.acceptConsent())
    expect(acceptLegalConsents).toHaveBeenCalledWith({
      termsOfServiceAgreed: true,
      privacyPolicyAcknowledged: true,
      sensitiveInformationAgreed: true,
      profileImageAgreed: false,
    })
    expect(hook.current.step).toBe('question')
  })

  it('동의를 미루면 시작 화면에 머문다', async () => {
    vi.mocked(getLegalConsentStatus).mockResolvedValue({
      ...consentStatus,
      sensitiveInformationAgreed: false,
    })
    const { result: hook } = await renderStartedDiagnosis()

    act(() => hook.current.declineConsent())
    expect(hook.current.consentStatus).toBe('idle')
    expect(hook.current.step).toBe('intro')
  })

  it('결과 화면에서 대시보드로 이동한다', async () => {
    const { result: hook } = await renderStartedDiagnosis()

    act(() => hook.current.goToDashboard())
    expect(navigate).toHaveBeenCalledWith('/dashboard', { replace: true })
  })
  it('공개 진단은 시작 버튼에서 동의 절차 없이 LANDING 문항을 조회한다', async () => {
    const { result: hook } = renderHook(() => useSelfDiagnosis('LANDING'), { wrapper })
    expect(getDiagnosisQuestions).not.toHaveBeenCalled()
    await act(() => hook.current.start())
    expect(hook.current.consentStatus).toBe('idle')
    expect(getLegalConsentStatus).not.toHaveBeenCalled()
    await waitFor(() => expect(hook.current.questionsStatus).toBe('success'))
    expect(getDiagnosisQuestions).toHaveBeenCalledWith('LANDING')
    expect(acceptLegalConsents).not.toHaveBeenCalled()
    expect(hook.current.step).toBe('question')
  })

  it('공개 진단은 문항 버전과 LANDING 유형으로 제출하고 서버 결과를 바로 표시한다', async () => {
    vi.mocked(getDiagnosisQuestions).mockResolvedValue(
      questions.map((q) => ({ ...q, questionnaireVersion: 'LANDING-v1' })),
    )
    vi.mocked(submitDiagnosis).mockResolvedValue(result)
    const { result: hook } = renderHook(() => useSelfDiagnosis('LANDING'), { wrapper })
    await act(() => hook.current.start())
    await waitFor(() => expect(hook.current.questionsStatus).toBe('success'))
    act(() => hook.current.selectAnswer(2))
    act(() => hook.current.goNext())
    act(() => hook.current.selectAnswer(4))
    await act(async () => hook.current.goNext())
    expect(submitDiagnosis).toHaveBeenCalledWith({
      sessionId: 'session-1',
      type: 'LANDING',
      answers: [2, 4],
      questionnaireVersion: 'LANDING-v1',
    })
    expect(hook.current.step).toBe('result')
    expect(hook.current.result).toEqual(result)
    act(() => hook.current.restart())
    expect(hook.current.step).toBe('intro')
    expect(hook.current.result).toBeNull()
  })
})
