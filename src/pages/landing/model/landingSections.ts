export const landingSections = [
  { id: 'intro', label: '처음' },
  { id: 'experience', label: '연습 흐름' },
  { id: 'diagnosis', label: '자가진단' },
  { id: 'faq', label: '자주 묻는 질문' },
  { id: 'download', label: '앱 다운로드' },
] as const

export type LandingSectionId = (typeof landingSections)[number]['id']
