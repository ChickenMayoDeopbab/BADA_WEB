import { getBiosignalReport } from '../api/biosignalApi'
import { buildBiosignalReportView } from './biosignalReport'
import { shouldRetryBiosignal } from './biosignalQuery'
import { useQuery } from '@tanstack/react-query'
import { useMemo } from 'react'

/** 워치 업로드를 기다리는 동안 다시 조회하는 간격입니다. */
const POLL_INTERVAL_MS = 5_000
/** 약 5분입니다. 앱이 통화 직후 워치 파일을 받아 올리는 가장 늦은 경우까지 기다립니다. */
const MAX_POLLS = 60

/** 통화의 '몸의 반응' 카드 내용을 불러옵니다. 실패하거나 보여 줄 값이 없으면 null입니다. */
export const useBiosignalReport = (sessionId: string | undefined, enabled = true) => {
  const { data } = useQuery({
    queryKey: ['biosignal-report', sessionId],
    queryFn: () => getBiosignalReport(sessionId as string),
    enabled: enabled && Boolean(sessionId),
    retry: shouldRetryBiosignal,
    refetchInterval: (query) =>
      query.state.data?.status === 'AWAITING_DATA' && query.state.dataUpdateCount < MAX_POLLS
        ? POLL_INTERVAL_MS
        : false,
  })

  return useMemo(() => buildBiosignalReportView(data), [data])
}
