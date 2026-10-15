import { useRef, useState } from 'react'

/** 요청이 끝난 뒤에도 회전 중인 아이콘이 한 바퀴를 마치도록 관리합니다. */
export const useCommentRefresh = (refresh: () => Promise<unknown>) => {
  const [isRefreshing, setIsRefreshing] = useState(false)
  const isRunning = useRef(false)
  const isRequestComplete = useRef(false)

  /** 댓글 조회를 한 번만 요청하고 회전 애니메이션을 시작합니다. */
  const handleRefresh = async () => {
    if (isRunning.current) return
    isRunning.current = true
    isRequestComplete.current = false
    setIsRefreshing(true)
    try {
      await refresh()
    } finally {
      isRequestComplete.current = true
    }
  }

  /** 요청 완료 후 첫 360도 회전 경계에서만 애니메이션을 끝냅니다. */
  const handleRotationComplete = () => {
    if (!isRequestComplete.current) return
    isRunning.current = false
    setIsRefreshing(false)
  }

  return { isRefreshing, handleRefresh, handleRotationComplete }
}
