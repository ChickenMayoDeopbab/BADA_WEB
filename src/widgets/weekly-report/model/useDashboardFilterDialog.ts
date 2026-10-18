import { useState, type FormEvent } from 'react'
import type { DashboardDetailsModel } from './useDashboardDetails'

/** 모달 안의 선택은 임시로 보관하고 적용할 때만 조회에 반영합니다. */
export const useDashboardFilterDialog = (
  model: Pick<DashboardDetailsModel, 'draft' | 'handleApplyQuery'>,
) => {
  const [isOpen, setIsOpen] = useState(false)
  const [draft, setDraft] = useState(model.draft)

  /** 현재 선택을 복사해 모달을 엽니다. */
  const handleOpen = () => {
    setDraft(model.draft)
    setIsOpen(true)
  }

  /** 임시 변경을 버리고 모달을 닫습니다. */
  const handleCancel = () => setIsOpen(false)

  /** 조회 기간은 유지하고 훈련 검색 항목을 초기화합니다. */
  const handleReset = () =>
    setDraft((current) => ({
      ...current,
      sessionType: undefined,
      difficulty: undefined,
      aiPersonality: undefined,
      scriptLevel: undefined,
      interval: 'DAY',
    }))

  /** 유효한 선택을 서버 조회에 반영하고 모달을 닫습니다. */
  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (model.handleApplyQuery(draft)) setIsOpen(false)
  }

  return { isOpen, draft, setDraft, handleOpen, handleCancel, handleReset, handleSubmit }
}

export type DashboardFilterDialogModel = ReturnType<typeof useDashboardFilterDialog>
