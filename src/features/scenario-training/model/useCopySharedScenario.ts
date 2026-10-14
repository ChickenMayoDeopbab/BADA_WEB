import { copySharedScenario } from '../api/scenarioTrainingApi'
import { useMutation, useQueryClient } from '@tanstack/react-query'

/** 커뮤니티에서 시나리오를 가져온 뒤 훈련 목록과 추천 캐시를 갱신합니다. */
export const useCopySharedScenario = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: copySharedScenario,
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['scenarios'] }),
        queryClient.invalidateQueries({ queryKey: ['scenario-recommendation'] }),
      ])
    },
  })
}
