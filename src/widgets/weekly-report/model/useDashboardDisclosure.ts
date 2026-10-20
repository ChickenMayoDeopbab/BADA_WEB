import { useId, useState } from 'react'

/** 펼침 항목의 접근성 연결과 열림 상태를 관리합니다. */
export const useDashboardDisclosure = () => {
  const panelId = useId()
  const [isExpanded, setIsExpanded] = useState(false)
  /** 버튼을 누를 때 펼침 상태를 반전합니다. */
  const handleToggle = () => setIsExpanded((current) => !current)
  return { panelId, isExpanded, handleToggle }
}
