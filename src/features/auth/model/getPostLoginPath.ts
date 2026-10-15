import { getCurrentUser, isDiagnosisRequired } from '@entities/user'
import { routePaths } from '@shared/config'

/**
 * 로그인 직후 이동할 경로를 정합니다.
 * 진단 기록이 없으면 자가진단으로 보내고, 프로필 조회에 실패하면 로그인을 막지 않도록 기본 경로로 보냅니다.
 */
export const getPostLoginPath = async (fallbackPath: string) => {
  try {
    const user = await getCurrentUser()
    return isDiagnosisRequired(user) ? routePaths.welcome : fallbackPath
  } catch {
    return fallbackPath
  }
}
