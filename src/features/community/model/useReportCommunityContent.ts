import { useMutation } from '@tanstack/react-query'
import { reportCommunityComment, reportCommunityPost } from '../api/communityApi'
import type { CommunityReportReason, CommunityReportTarget } from './report'

/** 게시글 또는 댓글·답글 ID에 선택한 신고 사유만 전송합니다. */
export const useReportCommunityContent = () =>
  useMutation({
    mutationFn: ({
      target,
      reason,
    }: {
      target: CommunityReportTarget
      reason: CommunityReportReason
    }) =>
      target.type === 'post'
        ? reportCommunityPost(target.id, reason)
        : reportCommunityComment(target.id, reason),
    retry: false,
  })
