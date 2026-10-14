export interface WeeklySummary {
  weekStart: string
  weekEnd: string
  trainingCount: number
  totalCallDurationSeconds: number
  averageStabilityScore: number
  averageConversationScore: number
  averageFluencyScore: number
  comment: string
}

export interface CallPhobiaLevel {
  code: string
  name: string
}

export interface DashboardMetrics {
  weekStart: string
  weekEnd: string
  dates: string[]
  stabilityScores: number[]
  conversationScores: number[]
  fluencyScores: number[]
  callPhobiaLevel: CallPhobiaLevel | null
}
