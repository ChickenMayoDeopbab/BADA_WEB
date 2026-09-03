import type {
  Attendance,
  DashboardMetrics,
  ScenarioRecommendation,
  TrainingRecordPage,
  WeeklySummary,
} from '../model/types'
import { handleUnauthorizedResponse } from '@shared/api'

const apiBaseUrl = 'https://spring.chickenmayo.kr/api/v1'
const aiApiBaseUrl = 'https://fastapi.chickenmayo.kr/api/v1'

type ApiError = {
  message?: string
}

type ApiResponse<T> = {
  data: T
  error?: ApiError | null
  message?: string
}

// 저장된 액세스 토큰을 가져온다.
const getAccessToken = () =>
  localStorage.getItem('badaAccessToken') || sessionStorage.getItem('badaAccessToken')

// 인증이 필요한 홈 대시보드 API 요청을 보낸다.
const requestHomeDashboard = async <T>(path: string, method = 'GET'): Promise<T> => {
  const accessToken = getAccessToken()
  const response = await fetch(`${apiBaseUrl}${path}`, {
    method,
    headers: { Authorization: `Bearer ${accessToken}` },
  })
  handleUnauthorizedResponse(response)
  const responseText = await response.text()
  const result = responseText
    ? JSON.parse(responseText) as ApiResponse<T>
    : { data: undefined as T }

  if (!response.ok || result.error) {
    throw new Error(result.error?.message || result.message || '홈 정보를 불러오지 못했습니다.')
  }

  return result.data
}

// 월간 출석 기록을 가져온다.
export const getMonthlyAttendance = (year: number, month: number) =>
  requestHomeDashboard<Attendance[]>(`/attendance?year=${year}&month=${month}`)

// 오늘 출석을 등록한다.
export const attendToday = () => requestHomeDashboard<boolean>('/attendance', 'POST')

// 최근 훈련 기록을 가져온다.
export const getRecentTrainingRecords = () =>
  requestHomeDashboard<TrainingRecordPage>('/training-records?page=0&size=20')

// 이번 주 훈련 요약을 가져온다.
export const getWeeklySummary = () =>
  requestHomeDashboard<WeeklySummary>('/dashboard/weekly-summary')

// 이번 주 훈련 지표를 가져온다.
export const getDashboardMetrics = () =>
  requestHomeDashboard<DashboardMetrics>('/dashboard/metrics')

// 오늘의 추천 훈련 시나리오를 가져온다.
export const getScenarioRecommendation = async () => {
  const accessToken = getAccessToken()
  const response = await fetch(`${aiApiBaseUrl}/scenario/recommendation`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  })
  handleUnauthorizedResponse(response)

  if (!response.ok) throw new Error('추천 시나리오를 불러오지 못했습니다.')

  return (await response.json()) as ScenarioRecommendation
}
