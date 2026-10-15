import { reportCommunityContent } from '../api/communityApi'
import type { CommunityReportReason, CommunityReportTarget } from './report'
import { useMutation } from '@tanstack/react-query'
import { useState } from 'react'

/** 선택한 게시글 또는 댓글의 신고 접수 상태를 관리합니다. */
export const useCommunityReport = (target: CommunityReportTarget) => {
  const [reason, setReason] = useState<CommunityReportReason | ''>('')
  const mutation = useMutation({
    mutationFn: (value: CommunityReportReason) => reportCommunityContent(target, value),
  })

  /** 사유를 선택한 경우에만 중복 없이 신고를 접수합니다. */
  const handleSubmit = () => {
    if (reason && !mutation.isPending && !mutation.isSuccess) mutation.mutate(reason)
  }

  return { ...mutation, reason, setReason, handleSubmit }
}
