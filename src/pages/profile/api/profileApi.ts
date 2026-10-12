import { getAccessToken } from '@features/auth'
import { httpClient } from '@shared/api'
import type { ApiResponse } from '@shared/types'

export interface MyPageProfile {
  username: string
  email: string
  name: string
  s3Key?: string
  level: 'LEVEL_1' | 'LEVEL_2' | 'LEVEL_3' | 'LEVEL_4' | 'LEVEL_5'
  levelName: string
  diagnosisDate?: string
  score?: number
  trainCount: number
  attendance: number
}

export interface UpdateMyPagePayload {
  name: string
  username: string
  s3Key?: string
}

export interface NotificationSettings {
  allEnabled: boolean
  communityEnabled: boolean
  trainingEnabled: boolean
}

export interface TrainingRecordSummary {
  recordId: number
  trainedAt: string
  scenarioName: string
  sessionType: 'SCENARIO' | 'CUSTOM' | 'WARMUP'
}

interface TrainingRecordPage {
  content: TrainingRecordSummary[]
}

interface FileUploadResponse {
  s3Key: string
  url: string
}

const authHeaders = () => {
  const accessToken = getAccessToken()

  return accessToken ? { Authorization: `Bearer ${accessToken}` } : undefined
}

export const getMyPage = async () => {
  const response = await httpClient.get<ApiResponse<MyPageProfile>>('/api/v1/user/mypage', {
    headers: authHeaders(),
  })
  return response.data.data
}

export const updateMyPage = async (payload: UpdateMyPagePayload) => {
  await httpClient.patch('/api/v1/user/mypage', payload, { headers: authHeaders() })
}

export const withdrawAccount = async () => {
  await httpClient.delete('/api/v1/auth/withdraw', { headers: authHeaders() })
}

export const uploadProfileImage = async (file: File) => {
  const formData = new FormData()
  formData.append('file', file)

  const response = await httpClient.post<ApiResponse<FileUploadResponse>>(
    '/api/v1/file/upload',
    formData,
    {
      params: { fileType: 'PROFILE' },
      headers: { ...authHeaders(), 'Content-Type': 'multipart/form-data' },
    },
  )
  return response.data.data
}

export const getProfileImageUrl = async (s3Key: string) => {
  const response = await httpClient.post<ApiResponse<{ url: string }>>(
    '/api/v1/file',
    undefined,
    { params: { s3Key }, headers: authHeaders() },
  )
  return response.data.data.url
}

export const getNotificationSettings = async () => {
  const response = await httpClient.get<ApiResponse<NotificationSettings>>(
    '/api/v1/notifications/settings',
    { headers: authHeaders() },
  )
  return response.data.data
}

export const updateNotificationSettings = async (settings: NotificationSettings) => {
  const response = await httpClient.put<ApiResponse<NotificationSettings>>(
    '/api/v1/notifications/settings',
    settings,
    { headers: authHeaders() },
  )
  return response.data.data
}

export const getRecentTrainingRecords = async () => {
  const response = await httpClient.get<ApiResponse<TrainingRecordPage>>('/api/v1/training-records', {
    params: { page: 0, size: 3 },
    headers: authHeaders(),
  })
  return response.data.data.content
}
