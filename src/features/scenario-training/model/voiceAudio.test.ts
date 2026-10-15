import { afterEach, expect, it, vi } from 'vitest'
import { VoiceAudio } from './voiceAudio'

afterEach(() => vi.unstubAllGlobals())

it('전송 게이트가 닫혀도 녹음 마이크를 유지하고 수동 음소거와 해제만 반영한다', async () => {
  const gain = { value: 1 }
  const track = { stop: vi.fn() }
  const node = { connect: vi.fn(), disconnect: vi.fn() }
  const stream = { getTracks: () => [track], getAudioTracks: () => [] }
  vi.stubGlobal('isSecureContext', true)
  vi.stubGlobal('navigator', {
    mediaDevices: { getSupportedConstraints: () => ({}), getUserMedia: async () => stream },
  })
  vi.stubGlobal(
    'AudioContext',
    class {
      state = 'running'
      sampleRate = 48000
      destination = node
      audioWorklet = { addModule: async () => {} }
      resume = async () => {}
      close = async () => {}
      createMediaStreamSource = () => node
      createMediaStreamDestination = () => ({ ...node, stream })
      createGain = () => ({ ...node, gain })
    },
  )
  vi.stubGlobal(
    'AudioWorkletNode',
    class {
      port = { postMessage: vi.fn(), close: vi.fn() }
      connect = node.connect
      disconnect = node.disconnect
    },
  )
  vi.stubGlobal(
    'MediaRecorder',
    class {
      static isTypeSupported = () => true
      state = 'inactive'
      start() {
        this.state = 'recording'
      }
      stop() {
        this.state = 'inactive'
      }
    },
  )
  const audio = new VoiceAudio({
    onPcm: vi.fn(),
    onBlocked: vi.fn(),
    onComplete: vi.fn(),
    onStats: vi.fn(),
    onError: vi.fn(),
    onSuspended: vi.fn(),
    onMicrophoneReady: vi.fn(),
  })
  await audio.prepare()
  audio.setCaptureEnabled(false)
  audio.toggleRecording()
  expect(gain.value).toBe(1)
  audio.setCaptureEnabled(true)
  audio.setCaptureEnabled(false)
  expect(gain.value).toBe(1)
  audio.setRecordingMuted(true)
  expect(gain.value).toBe(0)
  audio.toggleRecording()
  audio.toggleRecording()
  expect(gain.value).toBe(0)
  audio.setRecordingMuted(false)
  expect(gain.value).toBe(1)
  audio.dispose()
})
