export type TrainingPeriod = 'daily' | 'weekly' | 'monthly'

export interface TrainingFeedback {
  id: string
  startSecond: number
  endSecond: number
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
  transcript?: Array<{ role: 'ai' | 'user'; text: string }>
  feedbacks: TrainingFeedback[]
}

export interface TrainingPeriodOption {
  id: TrainingPeriod
  label: string
  range: string
}

export type TrainingSessionType = 'SCENARIO' | 'CUSTOM' | 'WARMUP'

export interface TrainingRecordSummary {
  recordId: number
  sessionId: string
  trainedAt: string
  scenarioName: string
  sessionType: TrainingSessionType
  durationSeconds: number
  scenarioImage?: string
  categoryIconUrl?: string
}
