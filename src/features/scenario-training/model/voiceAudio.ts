import { TrainPlayback, TRAIN_SAMPLE_RATE, type PlaybackStats } from './trainPlayback'
import { reportVoiceDiagnostic } from './voiceDiagnostics'

interface VoiceAudioOptions {
  onRecordingChange?: (isRecording: boolean) => void
  onRecordingComplete?: (blob: Blob) => void
  onRecordingError?: () => void
  onPcm: (data: ArrayBuffer) => void
  onBlocked: (blocked: boolean) => void
  onComplete: (turnId: number) => void
  onStats: (stats: PlaybackStats) => void
  onError: (error: unknown) => void
  onSuspended: (isSuspended: boolean) => void
  onMicrophoneReady: () => void
}

/** 하나의 오디오 그래프로 마이크 입력과 순서가 보장되는 AI 출력을 관리합니다. */
export class VoiceAudio {
  private options: VoiceAudioOptions
  private context: AudioContext | null = null
  private stream: MediaStream | null = null
  private input: MediaStreamAudioSourceNode | null = null
  private worklet: AudioWorkletNode | null = null
  private sources = new Set<AudioBufferSourceNode>()
  private recorder: MediaRecorder | null = null
  private recordingDestination: MediaStreamAudioDestinationNode | null = null
  private recordingGain: GainNode | null = null
  private nextTime = 0
  private isDisposed = false
  private isCaptureEnabled = false
  private isRecordingMuted = false
  readonly playback: TrainPlayback

  /** 앱 재생 제어기의 출력 드라이버를 Web Audio로 대체합니다. */
  constructor(options: VoiceAudioOptions) {
    this.options = options
    this.playback = new TrainPlayback({
      onBlocked: options.onBlocked,
      onComplete: options.onComplete,
      onStats: options.onStats,
      onError: options.onError,
      driver: { enqueue: this.enqueue, clear: this.clearPlayback, idle: () => {} },
    })
  }

  /** 사용자 클릭 안에서 AudioContext를 재개하고 마이크와 Worklet을 준비합니다. */
  prepare = async (): Promise<void> => {
    if (!window.isSecureContext) throw new Error('INSECURE_AUDIO')
    if (!navigator.mediaDevices?.getUserMedia || !window.AudioContext || !window.AudioWorkletNode)
      throw new Error('UNSUPPORTED_BROWSER')
    const context = new AudioContext({ latencyHint: 'interactive' })
    this.context = context
    context.onstatechange = () => {
      if (this.isDisposed) return
      this.options.onSuspended(context.state !== 'running')
    }
    // resume는 권한 요청 await 이전에 호출해 사용자 활성화를 보존합니다.
    const resume = context.resume()
    this.options.onSuspended(context.state !== 'running')
    const supported = navigator.mediaDevices.getSupportedConstraints()
    const constraints: MediaTrackConstraints = { channelCount: { ideal: 1 } }
    if (supported.echoCancellation) constraints.echoCancellation = { ideal: true }
    if (supported.noiseSuppression) constraints.noiseSuppression = { ideal: true }
    if (supported.autoGainControl) constraints.autoGainControl = { ideal: true }
    const microphone = navigator.mediaDevices
      .getUserMedia({ audio: constraints })
      .catch((error: unknown) => {
        if (
          !this.isDisposed &&
          error instanceof DOMException &&
          error.name === 'OverconstrainedError'
        )
          return navigator.mediaDevices.getUserMedia({ audio: true })
        throw error
      })
      .then((stream) => {
        if (this.isDisposed) {
          stream.getTracks().forEach((track) => track.stop())
          throw new Error('CALL_DISPOSED')
        }
        this.stream = stream
        stream.getAudioTracks().forEach((track) => {
          track.onended = () => this.options.onError(new Error('MICROPHONE_ENDED'))
        })
        this.options.onMicrophoneReady()
      })
    await Promise.all([resume, microphone])
    if (this.isDisposed) return
    if (!context.audioWorklet) throw new Error('UNSUPPORTED_BROWSER')
    await context.audioWorklet.addModule(
      new URL('./pcmProcessor.worklet.js?no-inline', import.meta.url).href,
    )
    if (this.isDisposed || !this.stream) return
    this.worklet = new AudioWorkletNode(context, 'bada-pcm', {
      numberOfInputs: 1,
      numberOfOutputs: 1,
      outputChannelCount: [1],
    })
    this.worklet.onprocessorerror = () => this.options.onError(new Error('AUDIO_PLAYBACK_FAILED'))
    this.worklet.port.onmessage = (event: MessageEvent<ArrayBuffer>) => {
      if (!this.isDisposed && this.isCaptureEnabled && context.state === 'running')
        this.options.onPcm(event.data)
    }
    this.input = context.createMediaStreamSource(this.stream)
    this.input.connect(this.worklet)
    this.worklet.connect(context.destination)
    this.options.onSuspended(context.state !== 'running')
    reportVoiceDiagnostic('microphone_ready', {
      inputSampleRate: context.sampleRate,
      wireSampleRate: TRAIN_SAMPLE_RATE,
      hasLiveTrack: this.stream.getAudioTracks().some((track) => track.readyState === 'live'),
    })
  }

  /** 차단 전환 시 Worklet의 부분 청크까지 비워 에코가 나중에 전송되지 않게 합니다. */
  setCaptureEnabled = (isEnabled: boolean) => {
    if (isEnabled === this.isCaptureEnabled) return
    this.isCaptureEnabled = isEnabled
    this.worklet?.port.postMessage({ enabled: isEnabled })
  }

  /** 로컬 녹음은 서버 전송 게이트와 분리하고 사용자가 누른 음소거만 반영합니다. */
  setRecordingMuted = (isMuted: boolean) => {
    this.isRecordingMuted = isMuted
    if (this.recordingGain) this.recordingGain.gain.value = isMuted ? 0 : 1
  }

  /** 마이크와 AI 출력을 혼합하고 사용자가 선택한 구간을 로컬 파일로 저장합니다. */
  toggleRecording = () => {
    if (this.recorder) {
      this.stopRecording()
      return
    }
    const context = this.context
    if (!context || !this.input || this.isDisposed || typeof MediaRecorder === 'undefined') {
      this.options.onRecordingError?.()
      return
    }
    try {
      if (!this.recordingDestination) {
        this.recordingDestination = context.createMediaStreamDestination()
        this.recordingGain = context.createGain()
        this.recordingGain.gain.value = this.isRecordingMuted ? 0 : 1
        this.input.connect(this.recordingGain)
        this.recordingGain.connect(this.recordingDestination)
        this.sources.forEach((source) => source.connect(this.recordingDestination!))
      }
      const mimeType = ['audio/webm;codecs=opus', 'audio/mp4', 'audio/webm'].find((type) =>
        MediaRecorder.isTypeSupported(type),
      )
      const recorder = new MediaRecorder(
        this.recordingDestination.stream,
        mimeType ? { mimeType } : undefined,
      )
      const chunks: Blob[] = []
      recorder.ondataavailable = ({ data }) => {
        if (data.size) chunks.push(data)
      }
      recorder.onstop = () => {
        if (chunks.length)
          this.options.onRecordingComplete?.(new Blob(chunks, { type: recorder.mimeType }))
        else this.options.onRecordingError?.()
      }
      recorder.onerror = () => {
        this.stopRecording()
        this.options.onRecordingError?.()
      }
      recorder.start(1000)
      this.recorder = recorder
      this.options.onRecordingChange?.(true)
    } catch {
      this.options.onRecordingError?.()
    }
  }

  /** 종료 시 마지막 데이터 청크를 받기 위해 녹음기를 먼저 정지합니다. */
  private stopRecording = () => {
    const recorder = this.recorder
    this.recorder = null
    if (recorder && recorder.state !== 'inactive') recorder.stop()
    if (recorder) this.options.onRecordingChange?.(false)
  }

  /** 자동 재생 제한 또는 장치 인터럽트 후 사용자 제스처로 오디오를 재개합니다. */
  resume = async () => {
    if (!this.context || this.isDisposed) return
    await this.context.resume()
    if (this.context.state !== 'running') throw new Error('AUDIO_RESUME_REQUIRED')
  }

  /** PCM 청크를 앞선 청크의 끝 시각에 예약하고 실제 onended를 추적합니다. */
  private enqueue = (samples: Float32Array, onEnded: () => void) => {
    const context = this.context
    if (!context || this.isDisposed) throw new Error('AUDIO_PLAYBACK_FAILED')
    const buffer = context.createBuffer(1, samples.length, TRAIN_SAMPLE_RATE)
    buffer.getChannelData(0).set(samples)
    const source = context.createBufferSource()
    source.buffer = buffer
    source.connect(context.destination)
    if (this.recordingDestination) source.connect(this.recordingDestination)
    this.sources.add(source)
    source.onended = () => {
      if (!this.sources.delete(source)) return
      source.disconnect()
      onEnded()
    }
    const start = Math.max(context.currentTime + 0.01, this.nextTime)
    this.nextTime = start + buffer.duration
    source.start(start)
  }

  /** 예약된 모든 음성을 정지하고 다음 통화에 출력이 남지 않게 합니다. */
  private clearPlayback = () => {
    for (const source of this.sources) {
      source.onended = null
      try {
        source.stop()
      } catch {
        /* 예약 실패나 이미 중단된 출력도 나머지 정리를 막지 않습니다. */
      }
      source.disconnect()
    }
    this.sources.clear()
    this.nextTime = 0
  }

  /** 권한 응답이 늦게 도착하더라도 트랙과 오디오 그래프를 모두 정리합니다. */
  dispose = () => {
    if (this.isDisposed) return
    this.stopRecording()
    this.recordingGain?.disconnect()
    this.recordingDestination?.stream.getTracks().forEach((track) => track.stop())
    this.isDisposed = true
    this.isCaptureEnabled = false
    this.playback.dispose()
    this.worklet?.port.close()
    if (this.worklet) this.worklet.onprocessorerror = null
    this.worklet?.disconnect()
    this.input?.disconnect()
    this.stream?.getTracks().forEach((track) => {
      track.onended = null
      track.stop()
    })
    const context = this.context
    this.context = null
    this.stream = null
    this.input = null
    this.worklet = null
    if (context) {
      context.onstatechange = null
      if (context.state !== 'closed') void context.close().catch(() => {})
    }
  }
}
