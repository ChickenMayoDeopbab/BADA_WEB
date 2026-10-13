import type { CurrentUser } from './types'

/** 진단 기록이 하나도 없어 자가진단을 먼저 받아야 하는 사용자인지 확인합니다. */
export const isDiagnosisRequired = (user: CurrentUser) =>
  !(user.diagnosisDate || user.level || user.levelName)
