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
import { useRef } from 'react'

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
  const query = useQuery({
    queryKey: profileKeys.recentTrainings,
    queryFn: getRecentTrainingRecords,
  })
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
      thumbnailUrl:
        record.categoryIconUrl ?? record.scenarioImage ?? details[index]?.data?.thumbnailUrl,
      detail: details[index]?.data,
    })),
  }
}

export const useUpdateMyPage = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: updateMyPage,
    onSuccess: () =>
      Promise.all([
        queryClient.invalidateQueries({ queryKey: profileKeys.all }),
        queryClient.invalidateQueries({ queryKey: ['user'] }),
      ]),
  })
}

export const useCheckUsername = () => useMutation({ mutationFn: checkUsername })

/** 프로필 저장 재시도 시 이미 업로드한 동일 파일을 다시 전송하지 않습니다. */
export const useUploadProfileImage = () => {
  const uploaded = useRef<{
    file: File
    result: Awaited<ReturnType<typeof uploadProfileImage>>
  } | null>(null)
  return useMutation({
    mutationFn: async (file: File) => {
      if (uploaded.current?.file === file) return uploaded.current.result
      const result = await uploadProfileImage(file)
      uploaded.current = { file, result }
      return result
    },
  })
}

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
