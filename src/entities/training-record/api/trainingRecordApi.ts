import type { TrainingRecordPageParams, TrainingRecordSummary } from '../model/types'
import { httpClient } from '@shared/api'
import type { ApiResponse, PageResponse } from '@shared/types'

/** 훈련 기록 목록을 페이지 단위로 조회합니다. */
export const getTrainingRecordPage = async ({
  page = 0,
  size = 20,
  ...filters
}: TrainingRecordPageParams) => {
  const { data } = await httpClient.get<ApiResponse<PageResponse<TrainingRecordSummary>>>(
    '/api/v1/training-records',
    { params: { ...filters, page, size } },
  )

  return data.data
}
