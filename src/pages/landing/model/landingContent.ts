export const tourFeatures = [
  {
    id: 'scenario',
    label: '상황 고르기',
    focusTitle: '오늘은, 피자 주문부터',
    focusDescription: '내가 필요한 상황을 선택해요.',
    eyebrow: '통화 전',
    title: '내일 해야 할 전화,\n오늘의 연습으로.',
    description: '필요한 상황을 고르고, 상대방의 성향과 난이도를 내게 맞춰보세요.',
  },
  {
    id: 'call',
    label: 'AI 통화 연습',
    focusTitle: '말이 막히는 순간에도',
    focusDescription: '스크립트를 보며 천천히 이어가요.',
    eyebrow: '통화 중',
    title: '진짜처럼 대화하고,\n편안하게 다시 해보고.',
    description: '실제 사람 대신 AI와 대화해요. 말이 막히면 스크립트를 보며 이어가세요.',
  },
  {
    id: 'report',
    label: '돌아보기',
    focusTitle: '다음 한 통을 위한 발견',
    focusDescription: '대화의 흐름과 피드백을 확인해요.',
    eyebrow: '통화 후',
    title: '내가 잘한 한마디를\n다시 발견해요.',
    description: '통화 기록과 구간별 피드백으로 잘한 점과 다음에 연습할 점을 확인해요.',
  },
] as const

export const landingQuestions = [
  {
    question: '앱을 설치해야만 연습할 수 있나요?',
    answer:
      '설치 없이 웹에서 로그인해 연습할 수 있어요. 휴대폰에서는 App Store와 Google Play에서 앱을 받을 수 있어요.',
  },
  {
    question: '실제 사람에게 전화가 걸리나요?',
    answer:
      '통화 연습에서는 AI가 시나리오 속 상대방 역할을 맡아요. 실제 사람에게 전화를 걸지 않고 대화를 연습할 수 있어요.',
  },
  {
    question: '진단 응답과 통화 데이터는 어떻게 처리되나요?',
    answer:
      '랜딩의 간단 체크는 이 화면에서만 계산하며 답변을 서버에 보내거나 저장하지 않아요. 회원 진단과 통화 분석의 정보 처리 동의는 서비스에서 별도로 안내해요. 자세한 처리 항목과 보유기간은 하단의 개인정보처리방침과 민감정보 처리 안내에서 확인할 수 있어요.',
  },
]
