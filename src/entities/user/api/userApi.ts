import type { CurrentUser } from '../model/types'
import { httpClient } from '@shared/api'
import type { ApiResponse } from '@shared/types'

/** 로그인한 사용자의 계정 정보를 조회합니다. */
export const getCurrentUser = async () => {
  const { data } = await httpClient.get<ApiResponse<CurrentUser>>('/api/v1/user/mypage')

  return data.data
}

/** 저장된 프로필 이미지의 조회 URL을 발급합니다. */
export const getProfileImageUrl = async (s3Key: string) => {
  const { data } = await httpClient.post<ApiResponse<{ url: string }>>('/api/v1/file', undefined, {
    params: { s3Key },
  })

  return data.data.url
}
