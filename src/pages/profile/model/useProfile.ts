import {
  checkUsernameAvailability,
  getMyPage,
  getNotificationSettings,
  getProfileImageUrl,
  getRecentTrainingRecords,
  updateMyPage,
  updateNotificationSettings,
  uploadProfileImage,
} from '../api/profileApi'
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

export const useCheckUsername = () => useMutation({ mutationFn: checkUsernameAvailability })

export const useUploadProfileImage = () => useMutation({ mutationFn: uploadProfileImage })

export const useNotificationSettings = () =>
  useQuery({ queryKey: profileKeys.notifications, queryFn: getNotificationSettings })

export const useUpdateNotificationSettings = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: updateNotificationSettings,
    onSuccess: (settings) => queryClient.setQueryData(profileKeys.notifications, settings),
  })
}
