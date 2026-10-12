import type { TrainingRecordSummary } from '../model/types'
import { httpClient } from '@shared/api'
import type { ApiResponse, PageResponse } from '@shared/types'

export interface TrainingRecordPageParams {
  page?: number
  size?: number
}

/** 훈련 기록 목록을 페이지 단위로 조회합니다. */
export const getTrainingRecordPage = async ({ page = 0, size = 20 }: TrainingRecordPageParams) => {
  const { data } = await httpClient.get<ApiResponse<PageResponse<TrainingRecordSummary>>>(
    '/api/v1/training-records',
    { params: { page, size } },
  )

  return data.data
}
