export const WEEKDAY_LABELS = ['일', '월', '화', '수', '목', '금', '토'] as const

const padTwoDigits = (value: number) => String(value).padStart(2, '0')

/** 로컬 시간 기준 날짜를 서버 날짜 형식(YYYY-MM-DD)으로 변환합니다. */
export const toDateKey = (date: Date) =>
  `${date.getFullYear()}-${padTwoDigits(date.getMonth() + 1)}-${padTwoDigits(date.getDate())}`

/** 서버 날짜 문자열(YYYY-MM-DD)을 로컬 자정 기준 Date로 변환합니다. */
export const parseDateKey = (dateKey: string) => {
  const [year, month, day] = dateKey.split('-').map(Number)

  return new Date(year, month - 1, day)
}

/** 기준 날짜에서 지정한 일수만큼 이동한 새 날짜를 반환합니다. */
export const addDays = (date: Date, days: number) =>
  new Date(date.getFullYear(), date.getMonth(), date.getDate() + days)

/** 날짜를 M/D 형식으로 표시합니다. */
export const formatMonthDay = (date: Date) => `${date.getMonth() + 1}/${date.getDate()}`

/** 초 단위 시간을 "N분 M초" 형식으로 표시합니다. 1분 미만이면 초만 표시합니다. */
export const formatDuration = (totalSeconds: number) => {
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60

  return minutes > 0 ? `${minutes}분 ${seconds}초` : `${seconds}초`
}
