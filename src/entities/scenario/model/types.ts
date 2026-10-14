export type ScenarioCategory = 'work' | 'daily' | 'school' | 'other'
export type ScenarioDifficulty = 'high' | 'medium' | 'low'
export type ScenarioPersonality = 'KIND' | 'NORMAL' | 'TOUGH' | 'RUDE'
export type ScenarioSessionType = 'SCENARIO' | 'CUSTOM'

export interface Scenario {
  scenarioId: number
  title: string
  content: string
  category: ScenarioCategory
  difficulties: ScenarioDifficulty[]
  personalities: ScenarioPersonality[]
  imageUrl?: string
  isCustom: boolean
  isCopied: boolean
  practiceCount: number
}

export interface ScenarioDialogueTurn {
  speaker: 'ai' | 'user'
  text: string
}

export interface ScenarioExample {
  dialogue: ScenarioDialogueTurn[]
  audioUrl?: string
}

export interface TrainingSession {
  sessionId: string
  wsUrl: string
}

export interface TrainingSessionConfiguration {
  scenarioId: number
  type: ScenarioSessionType
  aiPersonality: ScenarioPersonality
  difficulty: ScenarioDifficulty
  maxDurationSeconds?: number
}

export interface TrainingCallSchedule {
  scheduleId: number
  scheduledAt?: string
  status: 'SCHEDULED' | 'RINGING' | 'ACCEPTED' | 'CANCELED'
  sessionId?: string | null
  wsUrl?: string | null
}

export interface ScenarioRecommendation {
  scenario: Scenario
  reason?: 'CUSTOM_NOT_PRACTICED' | 'NOT_PRACTICED' | 'LONGEST_ABSENT'
  categoryIconUrl?: string
}

export interface ScenarioFeedback {
  sessionType: ScenarioSessionType | 'WARMUP'
  scenarioName: string
  trainingTime: string
  goodSegments: Array<{ start: number; end: number; good_point: string }>
  recordingUrl?: string | null
  transcript: Array<{ role: 'ai' | 'user'; text: string }>
}

export interface TrainingAnxietyScore {
  recordId: number
  sessionId: string
  anxietyScore: number
  scoreApplied: boolean
  scoreExclusionReason?: string | null
}

export interface ScenarioRouteState {
  callId?: string
  callScheduledAt?: number
  scenario?: Scenario
  session?: TrainingSession
  sessionConfiguration?: TrainingSessionConfiguration
  callDelaySeconds?: number
  callDurationSeconds?: number
  endReason?: string
  schedule?: TrainingCallSchedule
  isAnswered?: boolean
}
