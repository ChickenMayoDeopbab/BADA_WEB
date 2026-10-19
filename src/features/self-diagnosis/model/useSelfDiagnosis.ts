import type { ConsentStatus, SelfDiagnosisStep } from './types'
import {
  getDiagnosisQuestions,
  submitDiagnosis,
  type DiagnosisAnswer,
  type DiagnosisResult,
  type DiagnosisType,
} from '@entities/diagnosis'
import { acceptLegalConsents, getLegalConsentStatus } from '@entities/legal-consent'
import { getApiErrorMessage } from '@shared/api'
import { routePaths } from '@shared/config'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

/** 계산 완료 화면을 보여준 뒤 결과 화면으로 넘어가기까지의 시간입니다. */
export const RESULT_TRANSITION_DELAY_MS = 3000

const CONSENT_CHECK_ERROR_MESSAGE = '동의 상태를 확인하지 못했어요. 잠시 후 다시 시도해 주세요.'
const CONSENT_SAVE_ERROR_MESSAGE = '동의를 저장하지 못했어요. 잠시 후 다시 시도해 주세요.'
const SUBMIT_ERROR_MESSAGE = '레벨 계산에 실패했어요. 다시 시도해 주세요.'

// 자가진단의 단계 이동, 응답 저장, 민감정보 동의 확인, 결과 제출을 관리합니다.
export const useSelfDiagnosis = (type: DiagnosisType = 'SIGNUP') => {
  const isLanding = type === 'LANDING'
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [step, setStep] = useState<SelfDiagnosisStep>('intro')
  const [currentIndex, setCurrentIndex] = useState(0)
  const [answers, setAnswers] = useState<(DiagnosisAnswer | null)[]>([])
  const [sessionId, setSessionId] = useState('')
  const [result, setResult] = useState<DiagnosisResult | null>(null)
  const [consentStatus, setConsentStatus] = useState<ConsentStatus>('idle')
  const [profileImageAgreed, setProfileImageAgreed] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  const questionsQuery = useQuery({
    queryKey: ['diagnosis', 'questions', type],
    queryFn: () => getDiagnosisQuestions(type),
    enabled: !isLanding || step !== 'intro',
    retry: isLanding ? false : undefined,
    select: (questions) => [...questions].sort((a, b) => a.orderIndex - b.orderIndex),
  })
  const questions = questionsQuery.data ?? []
  const totalCount = questions.length

  // 계산 완료 화면을 잠시 보여준 뒤 결과 화면으로 넘어갑니다.
  useEffect(() => {
    if (step !== 'done') return

    const timer = window.setTimeout(() => setStep('result'), RESULT_TRANSITION_DELAY_MS)
    return () => window.clearTimeout(timer)
  }, [step])

  // 새 진단을 시작합니다. sessionId는 재시도 시 같은 진단으로 식별되도록 시작할 때 한 번만 만듭니다.
  const beginQuestions = () => {
    setSessionId(crypto.randomUUID())
    setAnswers([])
    setCurrentIndex(0)
    setErrorMessage('')
    setStep('question')
  }

  // 회원 진단은 서버 동의 상태를 확인하고, 공개 진단은 매 시작 시 현재 세션의 동의를 받습니다.
  const start = async () => {
    if (consentStatus !== 'idle') return

    setErrorMessage('')
    if (isLanding) {
      setConsentStatus('required')
      return
    }
    setConsentStatus('checking')
    try {
      const status = await getLegalConsentStatus()
      if (status.sensitiveInformationAgreed) {
        setConsentStatus('idle')
        beginQuestions()
        return
      }

      setProfileImageAgreed(status.profileImageAgreed)
      setConsentStatus('required')
    } catch (error) {
      setConsentStatus('idle')
      setErrorMessage(getApiErrorMessage(error, CONSENT_CHECK_ERROR_MESSAGE))
    }
  }

  // 공개 진단은 현재 세션에서 동의를 받고, 회원 진단은 기존 프로필 이미지 선택을 유지해 동의를 저장합니다.
  const acceptConsent = async () => {
    if (consentStatus !== 'required') return
    if (isLanding) {
      setConsentStatus('idle')
      beginQuestions()
      return
    }

    setConsentStatus('saving')
    try {
      const status = await acceptLegalConsents({
        termsOfServiceAgreed: true,
        privacyPolicyAcknowledged: true,
        sensitiveInformationAgreed: true,
        profileImageAgreed,
      })
      if (!status.sensitiveInformationAgreed) throw new Error('Sensitive consent was not saved')

      setConsentStatus('idle')
      beginQuestions()
    } catch (error) {
      setConsentStatus('idle')
      setErrorMessage(getApiErrorMessage(error, CONSENT_SAVE_ERROR_MESSAGE))
    }
  }

  /** 문항 버전과 같은 세션 ID로 응답을 제출합니다. 공개 진단은 회원 지표를 변경하지 않습니다. */
  const submit = async (submittedAnswers: DiagnosisAnswer[]) => {
    setStep('submitting')
    try {
      const nextResult = await submitDiagnosis({
        sessionId,
        type,
        answers: submittedAnswers,
        ...(questions[0]?.questionnaireVersion
          ? { questionnaireVersion: questions[0].questionnaireVersion }
          : {}),
      })
      setResult(nextResult)
      setStep(isLanding ? 'result' : 'done')
      // 회원 진단만 사이드바 레벨과 대시보드 지표에 반영합니다.
      if (!isLanding) {
        void queryClient.invalidateQueries({ queryKey: ['user'] })
        void queryClient.invalidateQueries({ queryKey: ['dashboard'] })
      }
    } catch (error) {
      setErrorMessage(getApiErrorMessage(error, SUBMIT_ERROR_MESSAGE))
      setStep('error')
    }
  }

  /** 현재 문항의 선택을 보존합니다. */
  const selectAnswer = (answer: DiagnosisAnswer) => {
    setAnswers((previous) => {
      const next = [...previous]
      next[currentIndex] = answer
      return next
    })
  }

  // 마지막 문항이면 모든 응답을 제출하고, 아니면 다음 문항으로 이동합니다.
  const goNext = () => {
    if (answers[currentIndex] == null) return

    if (currentIndex < totalCount - 1) {
      setCurrentIndex((index) => index + 1)
      return
    }

    void submit(answers.slice(0, totalCount) as DiagnosisAnswer[])
  }

  // 첫 문항에서 뒤로 가면 시작 화면으로 돌아갑니다. 이전 문항의 응답은 유지합니다.
  const goBack = () => {
    if (currentIndex > 0) {
      setCurrentIndex((index) => index - 1)
      return
    }

    setStep('intro')
  }

  return {
    step,
    consentStatus,
    errorMessage,
    questionsStatus: questionsQuery.status,
    currentQuestion: questions[currentIndex] ?? null,
    currentIndex,
    totalCount,
    currentAnswer: answers[currentIndex] ?? null,
    result,
    start,
    acceptConsent,
    declineConsent: () => setConsentStatus('idle'),
    retryQuestions: () => void questionsQuery.refetch(),
    retrySubmit: () => void submit(answers.slice(0, totalCount) as DiagnosisAnswer[]),
    selectAnswer,
    goNext,
    goBack,
    restart: () => {
      setResult(null)
      setAnswers([])
      setCurrentIndex(0)
      setErrorMessage('')
      setStep('intro')
    },
    goToDashboard: () => navigate(routePaths.dashboard, { replace: true }),
  }
}

export type SelfDiagnosis = ReturnType<typeof useSelfDiagnosis>
