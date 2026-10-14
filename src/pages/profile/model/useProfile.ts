import {
  getMyPage,
  getNotificationSettings,
  getProfileImageUrl,
  getRecentTrainingRecords,
  updateMyPage,
  updateNotificationSettings,
  uploadProfileImage,
  withdrawAccount,
} from '../api/profileApi'
import { checkUsername } from '@features/auth'
import { getTrainingRecord } from '@features/training-records'
import { useMutation, useQueries, useQuery, useQueryClient } from '@tanstack/react-query'

const profileKeys = {
  all: ['profile'] as const,
  detail: ['profile', 'detail'] as const,
  image: (s3Key: string) => ['profile', 'image', s3Key] as const,
  notifications: ['profile', 'notifications'] as const,
  recentTrainings: ['profile', 'recent-trainings'] as const,
}

export const useMyPage = () => useQuery({ queryKey: profileKeys.detail, queryFn: getMyPage })

export const useProfileImage = (s3Key?: string) =>
  useQuery({
    queryKey: profileKeys.image(s3Key ?? ''),
    queryFn: () => getProfileImageUrl(s3Key!),
    enabled: Boolean(s3Key),
  })

export const useRecentTrainings = () => {
  const query = useQuery({ queryKey: profileKeys.recentTrainings, queryFn: getRecentTrainingRecords })
  const details = useQueries({
    queries: (query.data ?? []).map((record) => ({
      queryKey: ['training-records', record.recordId],
      queryFn: () => getTrainingRecord(record.recordId),
      staleTime: 60_000,
    })),
  })
  return {
    ...query,
    data: query.data?.map((record, index) => ({
      ...record,
      thumbnailUrl: record.categoryIconUrl ?? record.scenarioImage ?? details[index]?.data?.thumbnailUrl,
      detail: details[index]?.data,
    })),
  }
}

export const useUpdateMyPage = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: updateMyPage,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: profileKeys.all }),
  })
}

export const useCheckUsername = () => useMutation({ mutationFn: checkUsername })

export const useUploadProfileImage = () => useMutation({ mutationFn: uploadProfileImage })

export const useWithdrawAccount = () => useMutation({ mutationFn: withdrawAccount })

export const useNotificationSettings = () =>
  useQuery({ queryKey: profileKeys.notifications, queryFn: getNotificationSettings })

export const useUpdateNotificationSettings = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: updateNotificationSettings,
    onSuccess: (settings) => queryClient.setQueryData(profileKeys.notifications, settings),
  })
}
