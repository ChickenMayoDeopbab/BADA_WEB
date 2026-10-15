import { getTrainingRecordPage, type TrainingRecordPageParams } from '../api/trainingRecordApi'
import { useQuery } from '@tanstack/react-query'

const trainingRecordKeys = {
  page: ({ page = 0, size = 20 }: TrainingRecordPageParams) =>
    ['training-records', 'page', page, size] as const,
}

/** 훈련 기록 목록의 한 페이지를 조회합니다. */
export const useTrainingRecordPage = (params: TrainingRecordPageParams = {}) =>
  useQuery({
    queryKey: trainingRecordKeys.page(params),
    queryFn: () => getTrainingRecordPage(params),
  })
