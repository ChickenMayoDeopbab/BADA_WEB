import type { DashboardCondition, DashboardQuery } from '@entities/dashboard'
import { addDays, parseDateKey, toDateKey } from '@shared/lib'

export type DashboardDetailView = 'comparison' | 'scenarios'

const exclusionLabels: Record<string, string> = {
  MISSING_SELF_REPORT: '불안 점수 미입력',
  INVALID_MEASUREMENT: '유효하지 않은 측정',
  UNSUPPORTED_END_REASON: '분석 대상이 아닌 종료 방식',
  MISSING_SPEECH_METRICS: '음성 측정 기록 없음',
  UNSUPPORTED_METRICS_VERSION: '지원하지 않는 분석 버전',
  UNAVAILABLE_METRIC: '측정할 수 없는 지표',
  UNKNOWN_CONDITION: '훈련 설정 정보 없음',
  NO_SHARED_CONDITION: '두 기간에 같은 상황과 설정의 훈련 없음',
  LOW_SAMPLE_SIZE: '측정된 훈련이 적음',
  OTHER_PERIOD_LOW_SAMPLE_SIZE: '다른 기간에 측정된 훈련이 적음',
}

/** 서버와 동일하게 서울 날짜를 기준으로 입력 가능한 종료일을 반환합니다. */
export const getDashboardToday = () =>
  new Intl.DateTimeFormat('sv-SE', { timeZone: 'Asia/Seoul' }).format(new Date())

/** 서버의 최대 366일 및 이전 동일 길이 비교 기간 제약을 검증합니다. */
export const validateDashboardDetailsPeriod = (
  { from, to }: DashboardQuery,
  today = getDashboardToday(),
) => {
  // 형식만 맞는 잘못된 달력 날짜를 차단합니다.
  const isDate = (value: string) =>
    /^\d{4}-\d{2}-\d{2}$/.test(value) && toDateKey(parseDateKey(value)) === value
  if (!isDate(from) || !isDate(to)) return '시작일과 종료일을 입력해 주세요.'
  if (from < '2000-01-01' || to > today || from > to)
    return '2000년 이후부터 오늘까지의 기간을 순서대로 선택해 주세요.'
  if (to > toDateKey(addDays(parseDateKey(from), 365)))
    return '기간은 최대 366일까지 선택할 수 있어요.'
  const start = parseDateKey(from)
  const end = parseDateKey(to)
  const days =
    Math.round(
      (Date.UTC(end.getFullYear(), end.getMonth(), end.getDate()) -
        Date.UTC(start.getFullYear(), start.getMonth(), start.getDate())) /
        86_400_000,
    ) + 1
  if (toDateKey(addDays(start, -days)) < '2000-01-01')
    return '이전 비교 기간도 2000년 이후가 되도록 선택해 주세요.'
  return null
}

/** 서버가 반환한 제외 사유를 건수와 함께 표시합니다. */
export const formatDashboardExclusions = (reasons: Record<string, number>) =>
  Object.entries(reasons)
    .filter(([, count]) => count > 0)
    .map(([reason, count]) => `${exclusionLabels[reason] ?? reason} ${count}건`)
    .join(' · ')

/** 비율 변화는 %p, 점수와 시간 변화는 원래 단위로 표시합니다. */
export const formatDashboardDelta = (value: number | null, unit: string) => {
  if (value === null) return '—'
  const suffix = { POINT: '점', PERCENTAGE_POINT: '%p', MILLISECOND: 'ms' }[unit] ?? unit
  return `${value > 0 ? '+' : ''}${value.toLocaleString('ko-KR', { maximumFractionDigits: 2 })}${suffix}`
}

/** 사용자가 고른 설정만 읽기 쉬운 이름으로 요약합니다. */
export const formatDashboardCondition = (condition: DashboardCondition) => {
  const personalities = { KIND: '친절함', NORMAL: '보통', TOUGH: '까다로움', RUDE: '무례함' }
  const difficulties: Record<string, string> = { low: '쉬움', medium: '보통', high: '어려움' }
  const labels = [
    condition.difficulty ? (difficulties[condition.difficulty] ?? condition.difficulty) : null,
    condition.aiPersonality ? personalities[condition.aiPersonality] : null,
    condition.scriptLevel != null ? `힌트 ${condition.scriptLevel}단계` : null,
  ].filter(Boolean)
  return labels.length ? labels.join(' · ') : '설정 정보가 없는 훈련'
}
