import { routePaths } from '@shared/config'

export const previewScenarios = [
  {
    id: 'daily',
    category: '일상',
    title: '미용실 예약하기',
    partner: '예약 담당자',
    description: '하고 싶은 말을 천천히 꺼내보는 것부터.',
    dialogue: [
      { speaker: 'ai', text: '안녕하세요, 바다 미용실입니다. 무엇을 도와드릴까요?' },
      { speaker: 'user', text: '안녕하세요. 내일 오후에 커트 예약하고 싶어요.' },
      { speaker: 'ai', text: '네, 오후 3시와 5시가 가능해요. 언제가 편하세요?' },
      { speaker: 'user', text: '오후 3시로 예약 부탁드릴게요. 감사합니다.' },
    ],
    feedback:
      '원하는 날짜와 용건을 먼저 전달했어요. 가능한 시간을 확인하고 대화를 마무리하는 흐름을 연습할 수 있어요.',
  },
  {
    id: 'work',
    category: '업무',
    title: '회의 일정 조율하기',
    partner: '업무 담당자',
    description: '업무 전화도, 한 번 연습하면 조금 더 익숙하게.',
    dialogue: [
      { speaker: 'ai', text: '안녕하세요. 바다팀 담당자입니다.' },
      { speaker: 'user', text: '안녕하세요. 내일 회의 일정을 조율하려고 전화드렸어요.' },
      { speaker: 'ai', text: '네, 혹시 오후 2시에 가능하실까요?' },
      { speaker: 'user', text: '네, 가능합니다. 내일 오후 2시에 뵙겠습니다.' },
    ],
    feedback:
      '전화를 건 목적을 먼저 밝혔어요. 상대방의 제안을 듣고 시간을 다시 확인하는 대화 흐름이에요.',
  },
  {
    id: 'school',
    category: '학교',
    title: '교수님께 상담 요청하기',
    partner: '지도 교수님',
    description: '조금 어려운 상대에게도, 내 이야기를 차분하게.',
    dialogue: [
      { speaker: 'ai', text: '네, 여보세요?' },
      { speaker: 'user', text: '교수님, 안녕하세요. 진로 상담을 요청드리고 싶어 전화드렸습니다.' },
      { speaker: 'ai', text: '좋아요. 이번 주 목요일 오후에 시간 괜찮나요?' },
      { speaker: 'user', text: '네, 목요일 오후에 찾아뵙겠습니다. 감사합니다.' },
    ],
    feedback:
      '인사 후 상담 목적을 명확하게 전했어요. 일정을 정하고 감사 인사로 끝내는 과정을 살펴볼 수 있어요.',
  },
] as const

export const tourFeatures = [
  {
    id: 'scenario',
    label: '상황 고르기',
    eyebrow: '01 / 당신의 일상에서',
    title: '내일 해야 할 전화,\n오늘의 연습으로.',
    description:
      '병원 예약부터 업무 전화까지. 마음에 걸리는 상황을 고르고, 상대방의 성향과 난이도를 내게 맞춰보세요.',
    action: '시나리오 보러 가기',
    destination: routePaths.training,
    annotation: '일상 · 업무 · 학교 · 나만의 시나리오',
  },
  {
    id: 'call',
    label: 'AI 통화 연습',
    eyebrow: '02 / 이제, 당신의 목소리로',
    title: '진짜처럼 대화하고,\n편안하게 다시 해보고.',
    description:
      '실제 사람에게 전화하지 않아요. AI와 내 속도로 대화하고, 말이 막힐 때는 스크립트의 도움을 받아보세요.',
    action: 'AI와 연습 시작하기',
    destination: routePaths.training,
    annotation: '실제 통화처럼, 부담은 가볍게',
  },
  {
    id: 'report',
    label: '돌아보기',
    eyebrow: '03 / 작은 변화를 발견하는 시간',
    title: '내가 잘한 한마디를\n다시 발견해요.',
    description:
      '통화 타임라인과 구간별 피드백으로 대화를 돌아보세요. 한 번의 연습이 다음 통화를 위한 경험으로 남아요.',
    action: '연습 기록 확인하기',
    destination: routePaths.records,
    annotation: '통화 기록 · 구간별 피드백 · 주간 리포트',
  },
] as const

export const landingQuestions = [
  {
    question: '앱을 설치해야만 연습할 수 있나요?',
    answer:
      '웹에서도 회원가입과 로그인 후 자가진단, AI 통화 연습, 기록 확인 등 실제 기능을 이용할 수 있어요. 휴대폰에서는 App Store와 ONE store에서 BADA 앱을 다운로드할 수 있어요.',
  },
  {
    question: '실제 사람에게 전화가 걸리나요?',
    answer:
      '통화 연습에서는 AI가 시나리오 속 상대방 역할을 맡아요. 실제 사람에게 전화를 걸지 않고 대화를 연습할 수 있어요.',
  },
  {
    question: '전화가 많이 부담스러워도 시작할 수 있나요?',
    answer:
      '처음부터 긴 대화를 이어갈 필요는 없어요. 통화 전 워밍업으로 가볍게 시작하거나 익숙한 상황과 편안한 상대방 성향을 선택해 보세요.',
  },
  {
    question: '나만의 상황으로 연습할 수 있나요?',
    answer:
      '맞춤 시나리오에서 연습하고 싶은 상황을 직접 만들 수 있어요. 실제로 앞두고 있는 전화나 다시 연습해 보고 싶은 대화를 준비해 보세요.',
  },
  {
    question: '진단 응답과 통화 데이터는 어떻게 처리되나요?',
    answer:
      '진단과 음성 분석에 필요한 민감정보 처리는 별도의 선택 동의를 받아 진행해요. 처리 항목, 목적, 외부 AI 서비스 이용 및 보유기간은 하단의 개인정보처리방침과 민감정보 처리 안내에서 확인할 수 있어요.',
  },
]
