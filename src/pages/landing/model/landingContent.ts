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
    id: 'diagnosis',
    label: '자가진단',
    eyebrow: '01 · 나를 알아가는 시간',
    title: '지금 내 마음은\n어떤 상태일까요?',
    description:
      '전화가 불편한 순간을 돌아보고, 자가진단으로 지금의 상태를 살펴보세요. 나를 이해하는 것이 첫 연습의 시작이에요.',
    action: '내 상태 알아보기',
    destination: routePaths.welcome,
  },
  {
    id: 'training',
    label: 'AI 통화 연습',
    eyebrow: '02 · 실전에 가까운 연습',
    title: '내일 해야 할 전화,\n오늘 먼저 연습해요.',
    description:
      '일상부터 업무, 학교까지. 필요한 상황과 난이도, 상대방의 성향을 선택하고 AI와 내 속도에 맞춰 대화해 보세요.',
    action: '시나리오 보러 가기',
    destination: routePaths.training,
  },
  {
    id: 'records',
    label: '기록과 피드백',
    eyebrow: '03 · 쌓이는 나의 경험',
    title: '잘한 순간을 발견하고,\n다음 대화를 준비해요.',
    description:
      '통화 내용과 구간별 피드백을 돌아보세요. 연습 기록과 주간 리포트로 내가 이어온 과정을 확인할 수 있어요.',
    action: '연습 기록 확인하기',
    destination: routePaths.records,
  },
  {
    id: 'community',
    label: '커뮤니티',
    eyebrow: '04 · 함께하는 연습',
    title: '비슷한 마음을 나누면,\n한 걸음이 가벼워져요.',
    description:
      '혼자만의 고민이라고 생각했던 순간들. 커뮤니티에서 연습 경험과 일상 이야기를 나누고, 서로의 작은 시도를 응원해요.',
    action: '커뮤니티 둘러보기',
    destination: routePaths.community,
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
