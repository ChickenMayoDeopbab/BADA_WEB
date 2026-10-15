import type { AppNotification } from '@entities/notification'
import { getProfileImageUrl } from '@entities/user'
import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'

/** 사용자 사진의 저장 키를 조회 URL로 변환하고 실패 시 기본 프로필로 복귀합니다. */
export const useNotificationAvatar = (notification: AppNotification) => {
  const isTraining = notification.type === 'TRAINING_REMINDER'
  const image = notification.actorProfileImage
  const [failedUrl, setFailedUrl] = useState<string | null>(null)
  const profile = useQuery({
    queryKey: ['notifications', 'profile-image', image],
    enabled: Boolean(image) && !isTraining,
    queryFn: () =>
      /^https?:\/\//i.test(image!) ? Promise.resolve(image!) : getProfileImageUrl(image!),
    staleTime: 5 * 60_000,
    retry: false,
  })
  return {
    isTraining,
    profileUrl: profile.data && profile.data !== failedUrl ? profile.data : null,
    handleError: () => setFailedUrl(profile.data ?? null),
  }
}
