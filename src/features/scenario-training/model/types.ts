import type {
  ScenarioCategory,
  ScenarioDifficulty,
  ScenarioPersonality,
  TrainingSessionConfiguration,
} from '@entities/scenario'

export interface CreateCustomScenarioRequest {
  title: string
  category: ScenarioCategory
  callTarget: string
  callPurpose: string
  personality?: ScenarioPersonality
  difficulty?: ScenarioDifficulty
}

export type CreateTrainingCallScheduleRequest = Omit<TrainingSessionConfiguration, 'difficulty'> & {
  minDelayMinutes: number
  maxDelayMinutes: number
}
