import type { BiosignalReportResponse } from '../model/types'
import { aiHttpClient } from '@shared/api'

/** 통화 생체신호 분석 결과를 조회합니다. 측정하지 않은 통화는 404, 남의 기록은 403입니다. */
export const getBiosignalReport = async (sessionId: string) => {
  const { data } = await aiHttpClient.get<BiosignalReportResponse>(
    `/api/v1/biosignals/${encodeURIComponent(sessionId)}`,
  )

  return data
}
