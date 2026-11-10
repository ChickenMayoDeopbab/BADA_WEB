import { useId, useState } from 'react'

/** 펼쳐야 보이는 숫자 영역의 접근성 연결과 열림 상태를 관리합니다. */
export const useBiosignalDisclosure = () => {
  const panelId = useId()
  const [isExpanded, setIsExpanded] = useState(false)
  /** 버튼을 누를 때 펼침 상태를 반전합니다. */
  const handleToggle = () => setIsExpanded((current) => !current)

  return { panelId, isExpanded, handleToggle }
}
