import type { TrainingPeriodOption, TrainingRecord } from './types'

export const trainingPeriodOptions: TrainingPeriodOption[] = [
  { id: 'daily', label: '일별', range: '8월 22일' },
  { id: 'weekly', label: '주별', range: '8월 16일~8월 22일' },
  { id: 'monthly', label: '월별', range: '8월' },
]

const pizzaFeedback = [
  {
    id: 'empathy',
    time: '1:31',
    title: '상대 입장을 잘 공감했어요.',
    description:
      '상대의 상황을 먼저 인정하는 한마디로 대화 분위기를 부드럽게 만들었어요.\n이런 공감 표현이 신뢰를 높입니다.',
  },
  {
    id: 'alternative',
    time: '4:12',
    title: '상황에 맞는 대안을 제시했어요.',
  },
  {
    id: 'thanks',
    time: '5:13',
    title: '감사 인사를 잘 했어요.',
  },
  {
    id: 'closing',
    time: '5:45',
    title: '정중한 마무리 인사를 건냈어요.',
  },
]

export const dummyTrainingRecords: TrainingRecord[] = [
  {
    id: 'pizza-order-1',
    date: '8월 16일',
    title: '피자 주문하기',
    emoji: '🍕',
    duration: '3분 12초',
    feedbackCount: 3,
    startedAt: '오후 01:22',
    anxietyScore: 9,
    feedbacks: pizzaFeedback,
  },
  {
    id: 'pizza-order-2',
    date: '8월 16일',
    title: '피자 주문하기',
    emoji: '🍕',
    duration: '3분 12초',
    feedbackCount: 3,
    startedAt: '오후 01:22',
    anxietyScore: 9,
    feedbacks: pizzaFeedback,
  },
  {
    id: 'pizza-order-3',
    date: '8월 16일',
    title: '피자 주문하기',
    emoji: '🍕',
    duration: '3분 12초',
    feedbackCount: 3,
    startedAt: '오후 01:22',
    anxietyScore: 9,
    feedbacks: pizzaFeedback,
  },
]
