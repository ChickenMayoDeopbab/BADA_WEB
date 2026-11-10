import { getBiosignalTrend } from '../api/biosignalApi'
import { shouldRetryBiosignal } from './biosignalQuery'
import { pickLatestBiosignalSession } from './latestBiosignalSession'
import { useQuery } from '@tanstack/react-query'

/** 가장 최근에 분석된 통화를 찾습니다. 측정 기록이 없거나 조회에 실패하면 null입니다. */
export const useLatestBiosignalSession = () => {
  const { data } = useQuery({
    queryKey: ['biosignal-trend'],
    queryFn: getBiosignalTrend,
    retry: shouldRetryBiosignal,
    select: pickLatestBiosignalSession,
  })

  return data ?? null
}
