import { useState } from 'react'
import type { PracticePreviewSelection } from './practicePreview'

/** 실제 통화 요청 없이 훈련 설정 미리보기의 선택만 변경합니다. */
export const usePracticePreview = () => {
  const [selection, setSelection] = useState<PracticePreviewSelection>({
    difficulty: 0,
    personality: 0,
  })
  /** 난이도와 상대 태도를 독립적으로 조절합니다. */
  const selectOption = (field: keyof PracticePreviewSelection, value: number) => {
    setSelection((current) => ({ ...current, [field]: value }))
  }
  return { selection, selectOption }
}
