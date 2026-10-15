import { saveCallRecording } from './saveCallRecording'
import { getCallErrorMessage } from './callErrors'
import { VoiceAudio } from './voiceAudio'
import { VoiceTransport } from './voiceTransport'
import type { ScriptHint, VoiceServerMessage } from './voiceProtocol'
import { reportVoiceDiagnostic } from './voiceDiagnostics'

export interface VoiceCallState {
  stage: 'preparing' | 'connecting' | 'active' | 'ending' | 'ended' | 'error'
  connection: 'idle' | 'connecting' | 'authenticated' | 'closed'
  startedAt: number | null
  durationSeconds: number
  isRecording: boolean
  isMuted: boolean
  isPlaybackBlocked: boolean
  isAudioSuspended: boolean
  isMicrophonePending: boolean
  displayName: string
  transcript: Array<{ role: 'ai' | 'user'; text: string }>
  scriptHint: ScriptHint | null
  notice: string
  endReason: string
  errorMessage: string
}

interface VoiceCallOptions {
  sessionId: string
  getToken: (shouldRefresh?: boolean) => Promise<string>
  onState: (state: VoiceCallState) => void
}

/** React와 분리된 통화 제어기로 사용자 음소거와 Half-Duplex 입력 게이트를 결합합니다. */
export class VoiceCall {
  private options: VoiceCallOptions
  private audio: VoiceAudio
  private transport: VoiceTransport
  private isDisposed = false
  private hasStarted = false
  private isAudioReady = false
  private microphoneBytes = 0
  private lastMicrophoneDiagnosticAt = 0
  private isCaptureBlocked = true
  private isServerMuted: boolean | null = null
  private endTimer: ReturnType<typeof setTimeout> | null = null
  private prepareTimer: ReturnType<typeof setTimeout> | null = null
  private state: VoiceCallState = {
    stage: 'preparing',
    connection: 'idle',
    startedAt: null,
    durationSeconds: 0,
    isRecording: false,
    isMuted: false,
    isPlaybackBlocked: false,
    isAudioSuspended: false,
    isMicrophonePending: true,
    displayName: '',
    transcript: [],
    scriptHint: null,
    notice: '',
    endReason: '',
    errorMessage: '',
  }

  /** 마이크, 실제 재생 완료, 서버 이벤트를 같은 통화 수명에 연결합니다. */
  constructor(options: VoiceCallOptions) {
    this.options = options
    this.transport = new VoiceTransport({
      sessionId: options.sessionId,
      getToken: options.getToken,
      onMessage: this.handleMessage,
      onBinary: (data) => {
        if (this.state.stage === 'active') this.audio.playback.push(data)
      },
      onError: this.fail,
      onClosed: () => {
        if (this.state.stage === 'ending') this.finish('USER_END')
        else if (this.state.stage !== 'ended') this.fail(new Error('WS_CLOSED'))
      },
    })
    this.audio = new VoiceAudio({
      onRecordingChange: (isRecording) =>
        this.update({
          isRecording,
        }),
      onRecordingComplete: (blob) => {
        saveCallRecording(blob, this.options.sessionId)
      },
      onRecordingError: () =>
        this.update({
          notice:
            '녹음을 저장하지 못했어요. 너무 짧게 녹음했거나 녹음을 지원하지 않는 브라우저일 수 있어요.',
        }),
      onPcm: (data) => {
        if (this.canSendAudio() && this.transport.sendBinary(data)) {
          this.microphoneBytes += data.byteLength
          if (Date.now() - this.lastMicrophoneDiagnosticAt >= 1000) {
            this.lastMicrophoneDiagnosticAt = Date.now()
            reportVoiceDiagnostic('microphone_sent', { bytes: this.microphoneBytes })
          }
        }
      },
      onBlocked: (isPlaybackBlocked) => {
        if (this.state.isPlaybackBlocked === isPlaybackBlocked) return
        this.update({ isPlaybackBlocked })
        this.syncMute()
      },
      onComplete: (turnId) => this.transport.sendJson({ type: 'playback_done', turn_id: turnId }),
      onStats: (stats) => {
        this.transport.sendJson(stats)
        reportVoiceDiagnostic('playback_stats', {
          chunks: stats.chunks,
          playedMs: stats.completed_played_ms,
          droppedChunks: stats.dropped_chunks,
          invalidBytes: stats.invalid_bytes,
          endReason: stats.end_reason,
        })
      },
      onError: this.fail,
      onMicrophoneReady: () => {
        if (this.isDisposed || ['error', 'ended'].includes(this.state.stage)) return
        // 권한 팝업에 답하는 시간은 오디오 초기화 제한 시간에 포함하지 않습니다.
        this.prepareTimer = setTimeout(() => this.fail(new Error('AUDIO_PREPARE_TIMEOUT')), 30000)
        this.update({ isMicrophonePending: false })
      },
      onSuspended: (isAudioSuspended) => {
        if (this.state.isAudioSuspended === isAudioSuspended) return
        this.update({ isAudioSuspended })
        this.syncMute()
      },
    })
  }

  /** 마이크 초기화를 클릭 안에서 시작하고 준비가 끝난 뒤 서버에 연결합니다. */
  start = async () => {
    if (this.hasStarted || this.isDisposed) return
    this.hasStarted = true
    this.update({ stage: 'preparing' })
    try {
      await this.audio.prepare()
      if (this.isDisposed || this.state.stage === 'error' || this.state.stage === 'ended') return
      if (this.prepareTimer) clearTimeout(this.prepareTimer)
      this.prepareTimer = null
      this.isAudioReady = true
      this.update({ stage: 'connecting', connection: 'connecting', isMicrophonePending: false })
      await this.transport.connect()
    } catch (error) {
      this.fail(error)
    }
  }

  /** 사용자 설정을 보존한 채 재생과 오디오 인터럽트 상태까지 입력 차단에 반영합니다. */
  private canSendAudio = () =>
    this.state.stage === 'active' &&
    this.isAudioReady &&
    !this.state.isMuted &&
    !this.state.isPlaybackBlocked &&
    !this.state.isAudioSuspended

  /** 서버 mute는 STT 입력 폐기이며 클라이언트 차단도 함께 적용합니다. */
  private syncMute = () => {
    if (this.isDisposed) return
    const isBlocked = !this.canSendAudio()
    this.audio.setCaptureEnabled(!isBlocked)
    this.audio.setRecordingMuted(this.state.isMuted)
    if (isBlocked !== this.isCaptureBlocked) {
      this.isCaptureBlocked = isBlocked
      reportVoiceDiagnostic('capture_gate', {
        enabled: !isBlocked,
        userMuted: this.state.isMuted,
        playbackBlocked: this.state.isPlaybackBlocked,
        microphoneBytes: this.microphoneBytes,
      })
    }
    // 앱의 boolean 상태 변경처럼 실제 게이트 전환마다 한 번만 서버에 알립니다.
    if (this.state.connection === 'authenticated' && this.isServerMuted !== isBlocked) {
      if (this.transport.sendJson({ type: 'mute', muted: isBlocked }))
        this.isServerMuted = isBlocked
    }
  }

  /** 실제 서버 transcript와 턴 경계를 통화 상태에 반영합니다. */
  private handleMessage = (message: VoiceServerMessage) => {
    if (this.isDisposed || this.state.stage === 'error' || this.state.stage === 'ended') return
    switch (message.type) {
      case 'scenario_info':
        if (this.state.stage === 'ending') return
        this.update({
          stage: 'active',
          connection: 'authenticated',
          startedAt: this.state.startedAt ?? Date.now(),
          displayName: message.aiRole.trim(),
        })
        this.syncMute()
        reportVoiceDiagnostic('authenticated', { audioReady: this.isAudioReady })
        break
      case 'emotion':
        if (this.state.stage === 'active') this.audio.playback.begin()
        break
      case 'speaking_end':
        if (this.state.stage === 'active') this.audio.playback.end(message.turn_id)
        break
      case 'interrupt':
        if (this.state.stage === 'active') this.audio.playback.reset('interrupt')
        break
      case 'transcript':
        if (message.text.trim())
          this.update({
            transcript: [
              ...this.state.transcript,
              { role: message.role, text: message.text },
            ].slice(-500),
            notice: '',
          })
        break
      case 'script_hint':
        this.update({ scriptHint: { level: message.level, text: message.text.trim() } })
        break
      case 'notice':
        this.update({ notice: message.text })
        break
      case 'end':
        if (message.reason === 'ERROR') this.fail(new Error('SERVER_ERROR'))
        else this.finish(message.reason)
        break
      case 'error':
        this.fail(new Error(message.code))
        break
      case 'pong':
        break
    }
  }

  /** 통화 중 사용자가 선택한 구간의 녹음을 시작하거나 저장합니다. */
  toggleRecording = () => {
    if (this.state.stage === 'active') this.audio.toggleRecording()
  }

  /** 사용자 음소거를 변경하고 입력 게이트와 동기화합니다. */
  toggleMute = () => {
    if (this.state.stage !== 'active') return
    this.update({ isMuted: !this.state.isMuted })
    this.syncMute()
  }

  /** 자동 재생 차단을 사용자 제스처로 해제합니다. */
  resumeAudio = async () => {
    try {
      await this.audio.resume()
    } catch (error) {
      this.fail(error)
    }
  }

  /** 입력과 출력을 즉시 정지하고 서버의 종료 확인을 제한 시간 동안 기다립니다. */
  end = () => {
    if (this.isDisposed || ['ending', 'ended', 'error'].includes(this.state.stage)) return
    const wasAuthenticated = this.state.connection === 'authenticated'
    this.update({ stage: 'ending', durationSeconds: this.duration() })
    this.syncMute()
    if (['error', 'ended'].includes(this.state.stage)) return
    this.audio.dispose()
    if (this.prepareTimer) clearTimeout(this.prepareTimer)
    this.prepareTimer = null
    if (['error', 'ended'].includes(this.state.stage)) return
    if (!wasAuthenticated) {
      this.finish('USER_END')
      return
    }
    // 서버는 녹음 업로드·음성 분석·피드백 저장 및 Spring 커밋 후 end를 보냅니다.
    this.endTimer = setTimeout(() => this.fail(new Error('WS_END_TIMEOUT')), 90000)
    if (!this.transport.sendJson({ type: 'end' })) this.fail(new Error('WS_SEND_FAILED'))
  }

  /** 경과 시간을 실제 인증·마이크 준비 완료 시점으로부터 계산합니다. */
  private duration = () =>
    this.state.startedAt === null
      ? 0
      : Math.max(0, Math.floor((Date.now() - this.state.startedAt) / 1000))

  /** 서버가 통화를 종료하면 리소스를 정리하고 결과 화면에 전달할 상태를 저장합니다. */
  private finish = (endReason: string) => {
    if (this.isDisposed || ['error', 'ended'].includes(this.state.stage)) return
    this.update({
      stage: 'ended',
      connection: 'closed',
      durationSeconds: this.state.stage === 'ending' ? this.state.durationSeconds : this.duration(),
      endReason,
    })
    this.cleanup()
    reportVoiceDiagnostic('call_ended', { endReason, microphoneBytes: this.microphoneBytes })
  }

  /** 검증된 안내 문구로 실패를 표시하고 성공 결과 화면으로 이동하지 않습니다. */
  private fail = (error: unknown) => {
    if (this.isDisposed || this.state.stage === 'error' || this.state.stage === 'ended') return
    this.update({
      stage: 'error',
      connection: 'closed',
      durationSeconds: this.state.stage === 'ending' ? this.state.durationSeconds : this.duration(),
      errorMessage: getCallErrorMessage(error),
    })
    this.cleanup()
    const code =
      error instanceof Error && /^[A-Z_]{1,64}$/.test(error.message) ? error.message : 'UNKNOWN'
    reportVoiceDiagnostic('call_failed', { code })
  }

  /** 새 스냅샷을 발행해 UI와 입력 게이트가 동일한 상태를 사용하게 합니다. */
  private update = (patch: Partial<VoiceCallState>) => {
    if (this.isDisposed) return
    this.state = { ...this.state, ...patch }
    this.options.onState(this.state)
  }

  /** 모든 타이머와 연결 및 오디오를 멱등적으로 정리합니다. */
  private cleanup = () => {
    if (this.endTimer) clearTimeout(this.endTimer)
    if (this.prepareTimer) clearTimeout(this.prepareTimer)
    this.endTimer = null
    this.prepareTimer = null
    this.audio.dispose()
    this.transport.dispose()
  }

  /** 페이지 이동이나 StrictMode 정리에서 현재 통화의 늦은 비동기 작업을 무효화합니다. */
  dispose = () => {
    if (this.isDisposed) return
    if (!['ended', 'error'].includes(this.state.stage)) this.transport.sendJson({ type: 'end' })
    this.isDisposed = true
    this.cleanup()
  }
}
