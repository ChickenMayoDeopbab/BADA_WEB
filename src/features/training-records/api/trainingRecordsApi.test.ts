import { describe, expect, it } from 'vitest'
import { env } from '@shared/config'
import { mapTrainingRecordDetail } from './trainingRecordsApi'

describe('mapTrainingRecordDetail', () => {
  it('전체 녹음 주소와 피드백 재생 구간을 화면 데이터로 변환한다', () => {
    const record = mapTrainingRecordDetail({
      recordId: 7,
      sessionId: 'session-7',
      trainedAt: '2026-10-12T04:22:00Z',
      scenarioId: 3,
      scenarioName: '상담 예약하기',
      sessionType: 'SCENARIO',
      aiPersonality: 'NORMAL',
      durationSeconds: 120,
      recordingUrl: '/recordings/session-7.mp3',
      anxietyScore: 3,
      positiveFeedbacks: [
        {
          startSecond: 10.2,
          endSecond: 13.8,
          good_point: '차분하게 말했어요.',
          summary: '말의 속도가 안정적이었어요.',
        },
      ],
    })

    expect(record.recordingUrl).toBe(
      new URL('/recordings/session-7.mp3', `${env.apiBaseUrl}/`).toString(),
    )
    expect(record.feedbacks[0]).toMatchObject({
      startSecond: 10.2,
      endSecond: 13.8,
      time: '0:10',
    })
    expect(record.feedbackCount).toBe(1)
  })
})
