export type TrainingPeriod = 'daily' | 'weekly' | 'monthly'

export interface TrainingFeedback {
  id: string
  time: string
  title: string
  description?: string
  audioUrl?: string
}

export interface TrainingRecord {
  id: number
  sessionId: string
  date: string
  trainedAt: string
  title: string
  emoji: string
  thumbnailUrl?: string
  duration: string
  durationSeconds: number
  feedbackCount?: number
  startedAt: string
  anxietyScore?: number
  recordingUrl?: string
  feedbacks: TrainingFeedback[]
}

export interface TrainingPeriodOption {
  id: TrainingPeriod
  label: string
  range: string
}
