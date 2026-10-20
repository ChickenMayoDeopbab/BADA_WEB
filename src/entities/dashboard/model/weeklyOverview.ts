import { addDays, parseDateKey, toDateKey } from '@shared/lib'
import type { DashboardOverview, DashboardQuery } from './analyticsTypes'

/** 서버의 서울 날짜를 기준으로 이번 주 월요일부터 오늘까지 조회합니다. */
export const getDashboardWeekQuery = (now = new Date()): DashboardQuery => {
  const today = new Intl.DateTimeFormat('sv-SE', { timeZone: 'Asia/Seoul' }).format(now)
  const date = parseDateKey(today)
  return {
    from: toDateKey(addDays(date, -((date.getDay() + 6) % 7))),
    to: today,
    interval: 'DAY',
  }
}

/** 기존 주간 요약에 필요한 필드를 개요 API의 실제 집계로 채웁니다. */
export const toWeeklySummary = (overview: DashboardOverview) => ({
  trainingCount: overview.summary.trainingCount,
  totalCallDurationSeconds: overview.summary.totalDurationSeconds,
  comment:
    overview.summary.trainingCount === 0
      ? '이번 주에는 아직 훈련 기록이 없어요.'
      : `${overview.summary.trainingDays}일 동안 ${overview.experience.scenarioCount}개 상황을 연습했어요. 새로운 상황 ${overview.experience.newScenarioCount}개 · 워밍업 ${overview.summary.warmupCount}회`,
})
