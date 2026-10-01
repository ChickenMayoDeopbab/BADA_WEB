export type TrainingPeriod = 'daily' | 'weekly' | 'monthly'

export interface TrainingFeedback {
  id: string
  time: string
  title: string
  description?: string
}

export interface TrainingRecord {
  id: string
  date: string
  title: string
  emoji: string
  duration: string
  feedbackCount: number
  startedAt: string
  anxietyScore: number
  feedbacks: TrainingFeedback[]
}

export interface TrainingPeriodOption {
  id: TrainingPeriod
  label: string
  range: string
}
