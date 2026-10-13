import { getCallErrorMessage } from './callErrors'
import { VoiceAudio } from './voiceAudio'
import { VoiceTransport } from './voiceTransport'
import type { VoiceServerMessage } from './voiceProtocol'

export interface VoiceCallState {
  stage: 'preparing' | 'connecting' | 'active' | 'ending' | 'ended' | 'error'
  connection: 'idle' | 'connecting' | 'authenticated' | 'closed'
  startedAt: number | null
  durationSeconds: number
  isMuted: boolean
  isPlaybackBlocked: boolean
  isAudioSuspended: boolean
  displayName: string
  transcript: Array<{ role: 'ai' | 'user'; text: string }>
  scriptHint: string
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
  private endTimer: ReturnType<typeof setTimeout> | null = null
  private prepareTimer: ReturnType<typeof setTimeout> | null = null
  private state: VoiceCallState = {
    stage: 'preparing',
    connection: 'idle',
    startedAt: null,
    durationSeconds: 0,
    isMuted: false,
    isPlaybackBlocked: false,
    isAudioSuspended: false,
    displayName: '',
    transcript: [],
    scriptHint: '',
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
      onPcm: (data) => {
        if (this.canSendAudio()) this.transport.sendBinary(data)
      },
      onBlocked: (isPlaybackBlocked) => {
        this.update({ isPlaybackBlocked })
        this.syncMute()
      },
      onComplete: (turnId) => this.transport.sendJson({ type: 'playback_done', turn_id: turnId }),
      onStats: (stats) => this.transport.sendJson(stats),
      onError: this.fail,
      onSuspended: (isAudioSuspended) => {
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
    this.prepareTimer = setTimeout(() => this.fail(new Error('AUDIO_PREPARE_TIMEOUT')), 30000)
    try {
      await this.audio.prepare()
      if (this.isDisposed || this.state.stage === 'error' || this.state.stage === 'ended') return
      if (this.prepareTimer) clearTimeout(this.prepareTimer)
      this.prepareTimer = null
      this.isAudioReady = true
      this.update({ stage: 'connecting', connection: 'connecting' })
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
    if (this.state.connection === 'authenticated')
      this.transport.sendJson({ type: 'mute', muted: isBlocked })
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
        this.update({ scriptHint: message.text })
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

  /** 명시적인 사용자 음소거만 변경해 자동 Half-Duplex 해제와 독립적으로 유지합니다. */
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
    this.endTimer = setTimeout(() => this.fail(new Error('WS_END_TIMEOUT')), 15000)
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
