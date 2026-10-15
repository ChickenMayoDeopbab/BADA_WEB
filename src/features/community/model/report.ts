export const communityReportReasons = [
  { value: 'ABUSE', label: '욕설 및 괴롭힘' },
  { value: 'SEXUAL', label: '음란한 내용' },
  { value: 'HATE', label: '혐오 및 차별' },
  { value: 'VIOLENCE', label: '폭력적인 내용' },
  { value: 'SPAM', label: '스팸 및 광고' },
  { value: 'PRIVACY', label: '개인정보 침해' },
  { value: 'OTHER', label: '기타' },
] as const

export type CommunityReportReason = (typeof communityReportReasons)[number]['value']
export interface CommunityReportTarget {
  type: 'post' | 'comment'
  id: number
}
