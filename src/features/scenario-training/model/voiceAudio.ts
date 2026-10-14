import { TrainPlayback, TRAIN_SAMPLE_RATE, type PlaybackStats } from './trainPlayback'
import { reportVoiceDiagnostic } from './voiceDiagnostics'

interface VoiceAudioOptions {
  onPcm: (data: ArrayBuffer) => void
  onBlocked: (blocked: boolean) => void
  onComplete: (turnId: number) => void
  onStats: (stats: PlaybackStats) => void
  onError: (error: unknown) => void
  onSuspended: (isSuspended: boolean) => void
}

/** 하나의 오디오 그래프로 마이크 입력과 순서가 보장되는 AI 출력을 관리합니다. */
export class VoiceAudio {
  private options: VoiceAudioOptions
  private context: AudioContext | null = null
  private stream: MediaStream | null = null
  private input: MediaStreamAudioSourceNode | null = null
  private worklet: AudioWorkletNode | null = null
  private sources = new Set<AudioBufferSourceNode>()
  private nextTime = 0
  private isDisposed = false
  private isCaptureEnabled = false
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
