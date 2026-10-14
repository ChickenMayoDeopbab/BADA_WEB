import type { TrainingRecordSummary, TrainingSessionType } from '@entities/training-record'
import { formatDuration, formatMonthDay } from '@shared/lib'

const SESSION_TYPE_LABELS: Record<TrainingSessionType, string> = {
  SCENARIO: '시나리오',
  CUSTOM: '커스텀',
  WARMUP: '워밍업',
}

/** 최근 훈련 기록 한 줄에 표시할 문구를 만듭니다. */
export const formatTrainingRecord = (record: TrainingRecordSummary) => ({
  id: record.recordId,
  trainedAt: record.trainedAt,
  title: record.scenarioName,
  meta: `${SESSION_TYPE_LABELS[record.sessionType]} · ${formatDuration(record.durationSeconds)}`,
  date: formatMonthDay(new Date(record.trainedAt)),
})
