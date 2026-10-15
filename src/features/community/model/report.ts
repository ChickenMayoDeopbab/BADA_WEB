export const communityReportReasons = [
  { value: 'ABUSE', label: '욕설 및 괴롭힘' },
  { value: 'SEXUAL', label: '음란성 콘텐츠' },
  { value: 'HATE', label: '혐오 표현' },
  { value: 'VIOLENCE', label: '폭력 및 위협' },
  { value: 'SPAM', label: '스팸 및 광고' },
  { value: 'PRIVACY', label: '개인정보 노출' },
  { value: 'OTHER', label: '기타' },
] as const

export type CommunityReportReason = (typeof communityReportReasons)[number]['value']
export interface CommunityReportTarget {
  type: 'post' | 'comment'
  id: number
  label: '게시글' | '댓글' | '답글'
}
