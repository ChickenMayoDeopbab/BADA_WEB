export const callHintOptions = [
  { id: 'advice', label: '조언', description: '스크립트를 보며 천천히 이어가요.' },
  { id: 'suggestion', label: '추천 문장', description: '다음 한마디가 어렵다면 문장을 참고해요.' },
  { id: 'none', label: '힌트 없이', description: '익숙해지면 내 말로 대화를 이어가요.' },
] as const

export type CallHintMode = (typeof callHintOptions)[number]['id']
