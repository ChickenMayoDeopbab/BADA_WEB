export type CallPhobiaLevelCode = 'LEVEL_1' | 'LEVEL_2' | 'LEVEL_3' | 'LEVEL_4' | 'LEVEL_5'

export interface CurrentUser {
  username: string
  email: string
  name: string
  s3Key?: string
  level?: CallPhobiaLevelCode | null
  levelName?: string | null
  diagnosisDate?: string | null
}
