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
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

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

export const useRecentTrainings = () =>
  useQuery({ queryKey: profileKeys.recentTrainings, queryFn: getRecentTrainingRecords })

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
