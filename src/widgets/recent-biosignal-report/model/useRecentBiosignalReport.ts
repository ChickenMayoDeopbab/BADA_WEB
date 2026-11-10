import {
  buildBiosignalSummary,
  useBiosignalReport,
  useLatestBiosignalSession,
} from '@entities/biosignal'
import { useTrainingRecordPage } from '@entities/training-record'
import { routePaths } from '@shared/config'
import { formatMonthDay } from '@shared/lib'
import { useMemo } from 'react'

/** 분석된 통화의 훈련 기록(제목·상세 링크)을 찾을 최근 기록 수입니다. */
const RECORD_LOOKUP_SIZE = 20

/** 가장 최근에 측정·분석된 통화의 '몸의 반응' 요약과 그 기록으로 가는 링크를 만듭니다. */
export const useRecentBiosignalReport = () => {
  const latest = useLatestBiosignalSession()
  const view = useBiosignalReport(latest?.sessionId)
  const summary = useMemo(() => buildBiosignalSummary(view), [view])
  const { data } = useTrainingRecordPage({ size: RECORD_LOOKUP_SIZE }, Boolean(summary))
  const record = data?.content.find((item) => item.sessionId === latest?.sessionId)
  const trainedAt = record?.trainedAt ?? latest?.at

  return {
    summary,
    title: record?.scenarioName ?? null,
    date: trainedAt ? formatMonthDay(new Date(trainedAt)) : null,
    // 최근 기록에서 찾지 못하면 기록 목록으로 보냅니다.
    recordPath: record
      ? `${routePaths.records}?recordId=${record.recordId}&trainedAt=${encodeURIComponent(record.trainedAt)}`
      : routePaths.records,
  }
}
