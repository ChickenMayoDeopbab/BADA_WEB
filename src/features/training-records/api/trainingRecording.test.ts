import { getTrainingAudioBuffer, getTrainingRecording } from './trainingRecordsApi'
import { env } from '@shared/config'
import { afterEach, expect, it, vi } from 'vitest'

const { get } = vi.hoisted(() => ({ get: vi.fn() }))
vi.mock('@shared/api', () => ({ httpClient: { get } }))
afterEach(() => {
  vi.clearAllMocks()
  vi.unstubAllGlobals()
})

it('전용 녹음 조회는 서버가 발급한 토큰과 취소 신호로 원본 바이너리를 받는다', async () => {
  const audio = new ArrayBuffer(8)
  get.mockResolvedValue({ data: audio })
  const signal = new AbortController().signal
  expect(await getTrainingRecording(37, 'recording-signed-token', signal)).toBe(audio)
  expect(get).toHaveBeenCalledWith('/api/v1/training-records/37/recording', {
    params: { token: 'recording-signed-token' },
    responseType: 'arraybuffer',
    signal,
  })
})

it('상세 응답의 녹음 URL에서 전용 토큰을 추출하고 인증 토큰으로 대체하지 않는다', async () => {
  get.mockResolvedValue({ data: new ArrayBuffer(8) })
  const fetchMock = vi.fn()
  vi.stubGlobal('fetch', fetchMock)
  await getTrainingAudioBuffer(
    `${env.apiBaseUrl}/api/v1/training-records/37/recording?token=signed%2Bvalue`,
  )
  expect(get).toHaveBeenCalledWith(
    '/api/v1/training-records/37/recording',
    expect.objectContaining({ params: { token: 'signed+value' } }),
  )
  expect(fetchMock).not.toHaveBeenCalled()
  get.mockClear()
  await expect(
    getTrainingAudioBuffer(`${env.apiBaseUrl}/api/v1/training-records/37/recording`),
  ).rejects.toThrow('녹음 조회 토큰')
  expect(get).not.toHaveBeenCalled()
})

it('외부 음원은 BADA 클라이언트를 사용하지 않는다', async () => {
  const audio = new ArrayBuffer(16)
  const fetchMock = vi.fn().mockResolvedValue({ ok: true, arrayBuffer: async () => audio })
  vi.stubGlobal('fetch', fetchMock)
  expect(
    await getTrainingAudioBuffer(
      'https://audio.example.test/api/v1/training-records/37/recording?token=external',
    ),
  ).toBe(audio)
  expect(get).not.toHaveBeenCalled()
  expect(fetchMock).toHaveBeenCalledWith(
    'https://audio.example.test/api/v1/training-records/37/recording?token=external',
  )
})
