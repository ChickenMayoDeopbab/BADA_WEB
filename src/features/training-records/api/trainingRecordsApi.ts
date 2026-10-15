import type { TrainingFeedback, TrainingRecord } from '@entities/training-record'
import { httpClient } from '@shared/api'
import { env } from '@shared/config'
import type { ApiResponse } from '@shared/types'

const TRAINING_RECORDS_PATH = '/api/v1/training-records'
const RECORDS_PAGE_SIZE = 100

/** 상세 응답에 포함된 녹음 전용 토큰으로 원본 음성을 조회합니다. */
export const getTrainingRecording = async (
  recordId: number,
  token: string,
  signal?: AbortSignal,
) => {
  const { data } = await httpClient.get<ArrayBuffer>(
    `${TRAINING_RECORDS_PATH}/${recordId}/recording`,
    {
      params: { token },
      responseType: 'arraybuffer',
      signal,
    },
  )
  return data
}

/** 서버 녹음 주소는 전용 API로, 외부 음원은 해당 주소에서 조회합니다. */
export const getTrainingAudioBuffer = async (audioUrl: string) => {
  const url = new URL(audioUrl, `${env.apiBaseUrl}/`)
  const recordMatch = url.pathname.match(/^\/api\/v1\/training-records\/(\d+)\/recording$/)
  if (url.origin === new URL(env.apiBaseUrl).origin && recordMatch) {
    const token = url.searchParams.get('token')
    if (!token) throw new Error('녹음 조회 토큰이 없습니다.')
    return getTrainingRecording(Number(recordMatch[1]), token)
  }
  const response = await fetch(url.toString())
  if (!response.ok) throw new Error('음성 파일을 불러오지 못했습니다.')
  return response.arrayBuffer()
}

type SessionType = 'SCENARIO' | 'CUSTOM' | 'WARMUP'

interface TrainingRecordResponse {
  recordId: number
  sessionId: string
  trainedAt: string
  scenarioName: string
  sessionType: SessionType
  durationSeconds: number
  scenarioImage?: string
  categoryIconUrl?: string
}

interface PositiveFeedbackResponse {
  startSecond: number
  endSecond: number
  good_point: string
  summary: string
  audioUrl?: string
}

interface TrainingRecordDetailResponse extends TrainingRecordResponse {
  scenarioId: number
  aiPersonality: 'KIND' | 'NORMAL' | 'TOUGH' | 'RUDE'
  recordingUrl?: string
  anxietyScore?: number
  positiveFeedbacks?: PositiveFeedbackResponse[]
  transcript?: Array<{ role: 'ai' | 'user'; text: string }>
}

interface TrainingRecordPageResponse {
  totalElements: number
  totalPages: number
  number: number
  content: TrainingRecordResponse[]
}

const formatDuration = (durationSeconds: number) => {
  const minutes = Math.floor(durationSeconds / 60)
  const seconds = durationSeconds % 60

  if (minutes === 0) return `${seconds}초`
  if (seconds === 0) return `${minutes}분`

  return `${minutes}분 ${seconds}초`
}

const formatFeedbackTime = (seconds: number) => {
  const safeSeconds = Math.max(0, Math.floor(seconds))
  const minutes = Math.floor(safeSeconds / 60)

  return `${minutes}:${String(safeSeconds % 60).padStart(2, '0')}`
}

const formatTrainedDate = (trainedAt: string) =>
  new Intl.DateTimeFormat('ko-KR', { month: 'long', day: 'numeric' }).format(new Date(trainedAt))

const formatTrainedTime = (trainedAt: string) =>
  new Intl.DateTimeFormat('ko-KR', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  }).format(new Date(trainedAt))

const getSessionEmoji = (sessionType: SessionType) => {
  if (sessionType === 'WARMUP') return '🔥'
  if (sessionType === 'CUSTOM') return '💬'

  return '📞'
}

// 상대 경로와 절대 경로로 전달되는 음성 주소를 재생 가능한 주소로 통일합니다.
const resolveAudioUrl = (audioUrl?: string) => {
  const normalizedAudioUrl = audioUrl?.trim()
  if (!normalizedAudioUrl) return undefined

  try {
    return new URL(normalizedAudioUrl, `${env.apiBaseUrl}/`).toString()
  } catch {
    return undefined
  }
}

const mapPositiveFeedback = (
  feedback: PositiveFeedbackResponse,
  recordId: number,
  index: number,
): TrainingFeedback => ({
  id: `${recordId}-${index}`,
  startSecond: feedback.startSecond,
  endSecond: feedback.endSecond,
  time: formatFeedbackTime(feedback.startSecond),
  title: feedback.good_point || feedback.summary || '긍정 피드백',
  description:
    feedback.summary && feedback.summary !== feedback.good_point ? feedback.summary : undefined,
  audioUrl: resolveAudioUrl(feedback.audioUrl),
})

/** 서버 훈련 기록을 화면에서 사용하는 형식으로 변환합니다. */
export const mapTrainingRecord = (record: TrainingRecordResponse): TrainingRecord => ({
  id: record.recordId,
  sessionId: record.sessionId,
  date: formatTrainedDate(record.trainedAt),
  trainedAt: record.trainedAt,
  title: record.scenarioName,
  emoji: getSessionEmoji(record.sessionType),
  thumbnailUrl: record.categoryIconUrl ?? record.scenarioImage,
  duration: formatDuration(record.durationSeconds),
  durationSeconds: record.durationSeconds,
  startedAt: formatTrainedTime(record.trainedAt),
  feedbacks: [],
})

/** 서버 훈련 기록 상세를 화면에서 사용하는 형식으로 변환합니다. */
export const mapTrainingRecordDetail = (record: TrainingRecordDetailResponse): TrainingRecord => {
  const feedbacks = (record.positiveFeedbacks ?? []).map((feedback, index) =>
    mapPositiveFeedback(feedback, record.recordId, index),
  )
  const recordingUrl = resolveAudioUrl(record.recordingUrl)
  const feedbackCount = feedbacks.filter(
    (feedback) =>
      Boolean(recordingUrl ?? feedback.audioUrl) && feedback.endSecond > feedback.startSecond,
  ).length

  return {
    ...mapTrainingRecord(record),
    anxietyScore: record.anxietyScore,
    recordingUrl,
    transcript: record.transcript ?? [],
    feedbackCount,
    feedbacks,
  }
}

const getTrainingRecordsPage = async (page: number) => {
  const { data } = await httpClient.get<ApiResponse<TrainingRecordPageResponse>>(
    TRAINING_RECORDS_PATH,
    { params: { page, size: RECORDS_PAGE_SIZE } },
  )

  return data.data
}

/** 로그인한 사용자의 전체 훈련 기록 목록을 조회합니다. */
export const getTrainingRecords = async () => {
  const firstPage = await getTrainingRecordsPage(0)
  const remainingPages = await Promise.all(
    Array.from({ length: Math.max(0, firstPage.totalPages - 1) }, (_, index) =>
      getTrainingRecordsPage(index + 1),
    ),
  )

  return [firstPage, ...remainingPages].flatMap((page) => page.content.map(mapTrainingRecord))
}

/** 선택한 훈련 기록의 상세 정보와 피드백을 조회합니다. */
export const getTrainingRecord = async (recordId: number) => {
  const { data } = await httpClient.get<ApiResponse<TrainingRecordDetailResponse>>(
    `${TRAINING_RECORDS_PATH}/${recordId}`,
  )

  return mapTrainingRecordDetail(data.data)
}

/** 선택한 훈련 기록을 삭제합니다. */
export const deleteTrainingRecord = async (recordId: number) => {
  await httpClient.delete<ApiResponse<null>>(`${TRAINING_RECORDS_PATH}/${recordId}`)
}
