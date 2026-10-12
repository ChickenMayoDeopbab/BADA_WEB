import { getCurrentUser, getProfileImageUrl } from '../api/userApi'
import { useQuery } from '@tanstack/react-query'

const userKeys = {
  current: ['user', 'current'] as const,
  profileImage: (s3Key: string) => ['user', 'profile-image', s3Key] as const,
}

/** 로그인한 사용자의 계정 정보를 조회합니다. */
export const useCurrentUser = () =>
  useQuery({
    queryKey: userKeys.current,
    queryFn: getCurrentUser,
  })

/** 프로필 이미지가 있을 때만 조회 URL을 발급합니다. */
export const useCurrentUserProfileImage = (s3Key?: string) =>
  useQuery({
    queryKey: userKeys.profileImage(s3Key ?? ''),
    queryFn: () => getProfileImageUrl(s3Key!),
    enabled: Boolean(s3Key),
  })
