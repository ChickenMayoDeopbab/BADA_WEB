import { createCustomScenario } from '../api/scenarioTrainingApi'
import type { ScenarioCategory } from '@entities/scenario'
import { getApiErrorMessage } from '@shared/api'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

export type CustomScenarioStep = 'info' | 'detail' | 'loading' | 'success' | 'error'

interface CustomScenarioForm {
  title: string
  category: ScenarioCategory | ''
  callTarget: string
  callPurpose: string
}

const initialForm: CustomScenarioForm = {
  title: '',
  category: '',
  callTarget: '',
  callPurpose: '',
}

/** 커스텀 시나리오 2단계 입력과 서버 생성을 관리합니다. */
export const useCustomScenario = () => {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [step, setStep] = useState<CustomScenarioStep>('info')
  const [form, setForm] = useState<CustomScenarioForm>(initialForm)
  const [isExitDialogOpen, setIsExitDialogOpen] = useState(false)
  const [isCategoryOpen, setIsCategoryOpen] = useState(false)
  const mutation = useMutation({
    mutationFn: createCustomScenario,
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['scenarios'] }),
        queryClient.invalidateQueries({ queryKey: ['scenario-recommendation'] }),
      ])
      setStep('success')
    },
    onError: () => setStep('error'),
  })

  const isInfoValid =
    form.title.trim().length > 0 && form.title.trim().length <= 50 && form.category !== ''
  const isDetailValid =
    form.callTarget.trim().length >= 2 &&
    form.callTarget.trim().length <= 100 &&
    form.callPurpose.trim().length >= 5 &&
    form.callPurpose.trim().length <= 200

  /** 폼의 한 필드를 현재 입력값으로 갱신합니다. */
  const handleFieldChange = <Key extends keyof CustomScenarioForm>(
    key: Key,
    value: CustomScenarioForm[Key],
  ) => {
    setForm((currentForm) => ({ ...currentForm, [key]: value }))
    if (key === 'category') setIsCategoryOpen(false)
  }

  /** 입력 단계에 맞춰 다음 화면으로 진행합니다. */
  const handleNext = () => {
    if (step === 'info' && isInfoValid) setStep('detail')
  }

  /** 완성된 입력값으로 커스텀 시나리오 생성을 요청합니다. */
  const handleSubmit = () => {
    if (step !== 'detail' || !isInfoValid || !isDetailValid || !form.category || mutation.isPending)
      return

    setStep('loading')
    mutation.mutate({
      title: form.title.trim(),
      category: form.category,
      callTarget: form.callTarget.trim(),
      callPurpose: form.callPurpose.trim(),
    })
  }

  /** 실패 상태를 마지막 입력 단계로 되돌립니다. */
  const handleRetry = () => {
    mutation.reset()
    setStep('detail')
  }

  /** 두 번째 단계에서는 첫 단계로 이동합니다. */
  const handlePrevious = () => {
    if (step === 'detail') setStep('info')
  }

  /** 작성 중 나가기 확인 대화상자를 엽니다. */
  const handleOpenExitDialog = () => setIsExitDialogOpen(true)

  /** 작성 중 나가기 확인 대화상자를 닫습니다. */
  const handleCloseExitDialog = () => setIsExitDialogOpen(false)

  /** 생성한 시나리오를 기존 설정·실시간 통화 흐름으로 전달합니다. */
  const handleStartTraining = () => {
    if (!mutation.data) return
    navigate(`/training/${mutation.data.scenarioId}/settings`, {
      replace: true,
      state: { scenario: mutation.data },
    })
  }

  /** 생성 완료 또는 작성 취소 후 커스텀 목록으로 돌아갑니다. */
  const handleGoToCatalog = () =>
    navigate('/training', { replace: step === 'success', state: { selectedTab: 'custom' } })

  /** 작성 단계를 보존하면서 이전 화면 또는 나가기 확인을 표시합니다. */
  const handleBack = () => {
    if (step === 'detail') handlePrevious()
    else handleOpenExitDialog()
  }

  return {
    step,
    form,
    createdScenario: mutation.data,
    isExitDialogOpen,
    isCategoryOpen,
    isInfoValid,
    isDetailValid,
    errorMessage: mutation.isError
      ? getApiErrorMessage(mutation.error, '시나리오를 생성하지 못했습니다.')
      : '',
    handleFieldChange,
    handleNext,
    handleSubmit,
    handleRetry,
    handlePrevious,
    handleOpenExitDialog,
    handleCloseExitDialog,
    handleStartTraining,
    handleGoToCatalog,
    handleBack,
    setIsCategoryOpen,
  }
}
