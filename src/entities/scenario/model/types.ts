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
}

export interface ScenarioRouteState {
  scenario?: Scenario
  session?: TrainingSession
  sessionConfiguration?: TrainingSessionConfiguration
  callDelaySeconds?: number
  callDurationSeconds?: number
  endReason?: string
}
