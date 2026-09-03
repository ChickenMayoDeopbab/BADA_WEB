export type Attendance = {
  date: string
}

export type TrainingRecord = {
  recordId: number
  sessionId: string
  trainedAt: string
  scenarioName: string
  sessionType: 'SCENARIO' | 'CUSTOM' | 'WARMUP'
  durationSeconds: number
  categoryIconUrl: string | null
}

export type TrainingRecordPage = {
  content: TrainingRecord[]
}

export type WeeklySummary = {
  weekStart: string
  weekEnd: string
  trainingCount: number
  totalCallDurationSeconds: number
  averageStabilityScore: number
  averageConversationScore: number
  averageFluencyScore: number
  comment: string
}

export type DashboardMetrics = {
  weekStart: string
  weekEnd: string
  dates: string[]
  stabilityScores: number[]
  conversationScores: number[]
  fluencyScores: number[]
  callPhobiaLevel: {
    code: string
    name: string
  }
}

export type ScenarioRecommendation = {
  scenario: {
    scenario_id: number
    title: string
    content: string
  }
  reason: 'CUSTOM_NOT_PRACTICED' | 'NOT_PRACTICED' | 'LONGEST_ABSENT'
  category_icon_url: string | null
}
