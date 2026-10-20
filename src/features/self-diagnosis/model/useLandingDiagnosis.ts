import { useState } from 'react'
import type { DiagnosisAnswer } from '@entities/diagnosis'
import { getLandingDiagnosisResult, landingDiagnosisQuestions } from './landingDiagnosis'

type LandingDiagnosisStep = 'intro' | 'question' | 'result'

/** 랜딩 체험은 인증·서버 제출 없이 이 화면의 메모리 안에서만 진행합니다. */
export const useLandingDiagnosis = () => {
  const [step, setStep] = useState<LandingDiagnosisStep>('intro')
  const [currentIndex, setCurrentIndex] = useState(0)
  const [answers, setAnswers] = useState<(DiagnosisAnswer | null)[]>([])
  const totalCount = landingDiagnosisQuestions.length

  /** 이전 체험을 지우고 바로 첫 문항을 엽니다. */
  const start = () => {
    setAnswers([])
    setCurrentIndex(0)
    setStep('question')
  }

  /** 현재 문항에 고른 응답을 보존합니다. */
  const selectAnswer = (answer: DiagnosisAnswer) => {
    setAnswers((current) => {
      const next = [...current]
      next[currentIndex] = answer
      return next
    })
  }

  /** 응답한 문항만 진행하고 다섯 문항이 끝나면 즉시 로컬 결과를 표시합니다. */
  const goNext = () => {
    if (answers[currentIndex] == null) return
    if (currentIndex < totalCount - 1) {
      setCurrentIndex((current) => current + 1)
      return
    }
    if (answers.filter((answer) => answer != null).length === totalCount) setStep('result')
  }

  /** 고른 응답을 유지하면서 이전 문항이나 시작 화면으로 돌아갑니다. */
  const goBack = () => {
    if (currentIndex === 0) setStep('intro')
    else setCurrentIndex((current) => current - 1)
  }

  /** 결과와 응답을 지우고 소개 화면으로 돌아갑니다. */
  const restart = () => {
    setAnswers([])
    setCurrentIndex(0)
    setStep('intro')
  }

  return {
    step,
    currentIndex,
    totalCount,
    currentQuestion: landingDiagnosisQuestions[currentIndex],
    currentAnswer: answers[currentIndex] ?? null,
    result: step === 'result' ? getLandingDiagnosisResult(answers as DiagnosisAnswer[]) : null,
    start,
    selectAnswer,
    goNext,
    goBack,
    restart,
  }
}
