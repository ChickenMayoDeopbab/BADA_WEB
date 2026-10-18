import type {
  DashboardCondition,
  DashboardMetricKey,
  DashboardMetricValue,
  DashboardQuery,
  DashboardStatus,
} from '@entities/dashboard'
import { addDays, parseDateKey, toDateKey } from '@shared/lib'

export const dashboardMetrics: Array<{
  key: DashboardMetricKey
  label: string
  description: string
}> = [
  {
    key: 'selfReportedAnxiety',
    label: '자가 보고 불안',
    description: '직접 입력한 불안 점수의 평균 (0~10점)',
  },
  {
    key: 'tremorTurnRate',
    label: '목소리 떨림',
    description: '측정 가능한 발화 중 떨림 기준에 해당한 발화 비율',
  },
  {
    key: 'longPauseTurnRate',
    label: '긴 멈춤',
    description: '측정 가능한 발화 중 말 중간에 긴 멈춤이 있었던 발화 비율',
  },
  {
    key: 'quietDropTurnRate',
    label: '음량 감소',
    description: '같은 통화의 평소 음량보다 작아진 발화 비율',
  },
  {
    key: 'fastRateTurnRate',
    label: '속도 증가',
    description: '같은 통화의 평소 속도보다 빨라진 발화 비율',
  },
  {
    key: 'responseDelayMs',
    label: '응답 대기 시간',
    description: '상대 발화 재생 완료부터 대답을 시작하기까지 걸린 평균 시간',
  },
]

export const dashboardStatusLabels: Record<DashboardStatus, string> = {
  READY: '측정 완료',
  INSUFFICIENT_DATA: '표본 부족',
  NO_DATA: '측정 기록 없음',
  NOT_COMPARABLE: '동일 조건 비교 불가',
}

const exclusionLabels: Record<string, string> = {
  MISSING_SELF_REPORT: '불안 점수 미입력',
  INVALID_MEASUREMENT: '유효하지 않은 측정',
  UNSUPPORTED_END_REASON: '분석 대상이 아닌 종료 방식',
  MISSING_SPEECH_METRICS: '음성 측정 기록 없음',
  UNSUPPORTED_METRICS_VERSION: '지원하지 않는 분석 버전',
  UNAVAILABLE_METRIC: '측정할 수 없는 지표',
  UNKNOWN_CONDITION: '훈련 조건 정보 없음',
  NO_SHARED_CONDITION: '공통 훈련 조건 없음',
  LOW_SAMPLE_SIZE: '표본 수 부족',
  OTHER_PERIOD_LOW_SAMPLE_SIZE: '상대 기간의 표본 수 부족',
}

/** 서버 기준 시간대인 서울의 오늘 날짜를 반환합니다. */
export const getDashboardToday = () =>
  new Intl.DateTimeFormat('sv-SE', { timeZone: 'Asia/Seoul' }).format(new Date())

/** 최근 28일을 기본 조회 기간으로 사용합니다. */
export const getInitialDashboardQuery = (): DashboardQuery => {
  const to = getDashboardToday()
  return { from: toDateKey(addDays(parseDateKey(to), -27)), to, interval: 'WEEK' }
}

/** 서버의 기간 제약을 적용하고 잘못된 날짜 요청을 방지합니다. */
export const validateDashboardPeriod = (from: string, to: string, today = getDashboardToday()) => {
  // 달력에 존재하는 날짜만 허용합니다.
  const isDateKey = (value: string) =>
    /^\d{4}-\d{2}-\d{2}$/.test(value) && toDateKey(parseDateKey(value)) === value
  if (!isDateKey(from) || !isDateKey(to)) return '시작일과 종료일을 입력해 주세요.'
  if (from < '2000-01-01' || to > today || from > to)
    return '2000년 1월 1일부터 오늘까지의 기간을 순서대로 선택해 주세요.'
  if (toDateKey(addDays(parseDateKey(from), 365)) < to)
    return '조회 기간은 최대 366일까지 선택할 수 있어요.'
  return null
}

/** 이전 동일 길이 기간이 서버가 지원하는 날짜 범위에 포함되는지 확인합니다. */
export const canCompareDashboardPeriod = ({ from, to }: DashboardQuery) => {
  const start = parseDateKey(from)
  const end = parseDateKey(to)
  const days =
    Math.round(
      (Date.UTC(end.getFullYear(), end.getMonth(), end.getDate()) -
        Date.UTC(start.getFullYear(), start.getMonth(), start.getDate())) /
        86_400_000,
    ) + 1
  return toDateKey(addDays(start, -days)) >= '2000-01-01'
}

/** 0과 미측정 값을 구분하고 지표의 원래 단위를 표시합니다. */
export const formatDashboardValue = (value: number | null, unit: string) => {
  if (value === null) return '—'
  const suffix =
    { SCORE_0_10: '점', POINT: '점', PERCENT: '%', PERCENTAGE_POINT: '%p', MILLISECOND: 'ms' }[
      unit
    ] ?? unit
  return `${value.toLocaleString('ko-KR', { maximumFractionDigits: 2 })}${suffix}`
}

/** 서버가 제공한 제외 사유를 사용자가 이해할 수 있는 문구로 표시합니다. */
export const formatDashboardExclusions = (metric: DashboardMetricValue) =>
  Object.entries(metric.exclusionReasons)
    .filter(([, count]) => count > 0)
    .map(([reason, count]) => `${exclusionLabels[reason] ?? reason} ${count}건`)
    .join(' · ')

/** 비교와 기록 조회에 사용되는 훈련 조건을 요약합니다. */
export const formatDashboardCondition = (condition: DashboardCondition) => {
  const personalities = { KIND: '친절함', NORMAL: '보통', TOUGH: '까다로움', RUDE: '무례함' }
  return [
    condition.sessionType == null
      ? '훈련 유형 정보 없음'
      : condition.sessionType === 'CUSTOM'
        ? '직접 만든 상황'
        : '기본 상황',
    condition.scenarioId == null ? '상황 정보 없음' : `상황 #${condition.scenarioId}`,
    condition.scenarioVersion ? `버전 ${condition.scenarioVersion}` : '버전 정보 없음',
    condition.difficulty ?? '난이도 정보 없음',
    condition.aiPersonality ? personalities[condition.aiPersonality] : '성격 정보 없음',
    condition.scriptLevel == null ? '힌트 정보 없음' : `힌트 ${condition.scriptLevel}단계`,
  ].join(' · ')
}
