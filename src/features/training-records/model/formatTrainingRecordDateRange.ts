import type { TrainingRecordDateRange } from './useTrainingRecordCalendar'

// 선택된 날짜 범위를 화면에 표시할 문자열로 변환합니다.
export const formatTrainingRecordDateRange = ({ start, end }: TrainingRecordDateRange) => {
  const startLabel = `${start.getMonth() + 1}월 ${start.getDate()}일`
  const endLabel = `${end.getMonth() + 1}월 ${end.getDate()}일`
  const isSameDate =
    start.getFullYear() === end.getFullYear() &&
    start.getMonth() === end.getMonth() &&
    start.getDate() === end.getDate()

  return isSameDate ? startLabel : `${startLabel} ~ ${endLabel}`
}
