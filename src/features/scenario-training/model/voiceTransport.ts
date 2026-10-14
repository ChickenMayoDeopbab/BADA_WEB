import { createVoiceUrl, parseVoiceMessage, type VoiceServerMessage } from './voiceProtocol'
import { env } from '@shared/config'

export interface VoiceTransportOptions {
  sessionId: string
  getToken: (shouldRefresh?: boolean) => Promise<string>
  onMessage: (message: VoiceServerMessage) => void
  onBinary: (data: ArrayBuffer) => void
  onError: (error: unknown) => void
  onClosed: () => void
}

/** 인증과 연결만 담당하며 오디오와 화면 상태를 참조하지 않습니다. */
export class VoiceTransport {
  private options: VoiceTransportOptions
  private socket: WebSocket | null = null
  private pingTimer: ReturnType<typeof setInterval> | null = null
  private connectTimer: ReturnType<typeof setTimeout> | null = null
  private isDisposed = false
  private hasRefreshed = false
  private hasAuthenticated = false
  private lastPongAt = 0

  /** WebSocket 수명에 묶인 콜백을 저장합니다. */
  constructor(options: VoiceTransportOptions) {
    this.options = options
  }

  /** 만료 토큰을 갱신하고 현재 통화가 유효한 경우에만 연결합니다. */
  connect = async (shouldRefresh = false) => {
    try {
      this.connectTimer = setTimeout(() => this.fail(new Error('WS_TIMEOUT')), 20000)
      const token = await this.options.getToken(shouldRefresh)
      if (this.isDisposed) return
      const socket = new WebSocket(createVoiceUrl(this.options.sessionId, token))
      this.socket = socket
      socket.binaryType = 'arraybuffer'
      socket.onopen = () => {
        if (this.isDisposed || this.socket !== socket) return
        if (env.voiceAuthMode === 'frame') this.sendJson({ type: 'auth', token })
        this.sendJson({ type: 'playback_capabilities', completion_ack: true })
        this.lastPongAt = Date.now()
        this.pingTimer = setInterval(() => {
          if (Date.now() - this.lastPongAt > 65000) {
            this.fail(new Error('WS_HEARTBEAT_TIMEOUT'))
            return
          }
          this.sendJson({ type: 'ping' })
        }, 30000)
      }
      socket.onmessage = (event: MessageEvent<unknown>) => {
        if (this.isDisposed || this.socket !== socket) return
        try {
          if (typeof event.data === 'string') {
            const message = parseVoiceMessage(event.data)
            if (!message) return
            if (message.type === 'scenario_info') {
              this.hasAuthenticated = true
              if (this.connectTimer) clearTimeout(this.connectTimer)
              this.connectTimer = null
            }
            if (message.type === 'pong') this.lastPongAt = Date.now()
            this.options.onMessage(message)
          } else if (event.data instanceof ArrayBuffer && this.hasAuthenticated) {
            this.options.onBinary(event.data)
          } else {
            throw new Error('WS_INVALID_MESSAGE')
          }
        } catch (error) {
          this.fail(error)
        }
      }
      socket.onerror = () => this.fail(new Error('WS_CONNECTION_FAILED'))
      socket.onclose = (event) => {
        if (this.isDisposed || this.socket !== socket) return
        this.clearTimers()
        this.socket = null
        // 인증 이전 만료는 한 번만 재시도합니다. 진행 중 세션은 자동으로 재생성하지 않습니다.
        if (
          event.code === 1008 &&
          event.reason === 'TOKEN_EXPIRED' &&
          !this.hasAuthenticated &&
          !this.hasRefreshed
        ) {
          this.hasRefreshed = true
          void this.connect(true)
        } else if (event.code === 1000) this.options.onClosed()
        else
          this.fail(
            new Error(
              event.code === 1008 && /^[A-Z_]+$/.test(event.reason) ? event.reason : 'WS_CLOSED',
            ),
          )
      }
    } catch (error) {
      if (!this.isDisposed) this.fail(error)
    }
  }

  /** 토큰이나 연결 URL을 로깅하지 않고 제어 메시지를 보냅니다. */
  sendJson = (payload: object): boolean => {
    if (this.isDisposed || this.socket?.readyState !== WebSocket.OPEN) return false
    try {
      this.socket.send(JSON.stringify(payload))
      return true
    } catch {
      this.fail(new Error('WS_SEND_FAILED'))
      return false
    }
  }

  /** 과도한 송신 대기가 발생하면 오래된 음성을 쌓지 않고 연결 실패로 처리합니다. */
  sendBinary = (data: ArrayBuffer): boolean => {
    if (this.isDisposed || !this.hasAuthenticated || this.socket?.readyState !== WebSocket.OPEN)
      return false
    if (this.socket.bufferedAmount > 64000) {
      this.fail(new Error('WS_BACKPRESSURE'))
      return false
    }
    try {
      this.socket.send(data)
      return true
    } catch {
      this.fail(new Error('WS_SEND_FAILED'))
      return false
    }
  }

  /** 연결과 heartbeat 타이머를 제거합니다. */
  private clearTimers = () => {
    if (this.pingTimer) clearInterval(this.pingTimer)
    if (this.connectTimer) clearTimeout(this.connectTimer)
    this.pingTimer = null
    this.connectTimer = null
  }

  /** 실패 후 추가 이벤트가 중복 종료를 일으키지 않게 합니다. */
  private fail = (error: unknown) => {
    if (this.isDisposed) return
    this.dispose()
    this.options.onError(error)
  }

  /** 늦게 도착한 토큰 갱신과 연결 콜백까지 무효화합니다. */
  dispose = () => {
    if (this.isDisposed) return
    this.isDisposed = true
    this.clearTimers()
    const socket = this.socket
    this.socket = null
    if (socket) {
      socket.onopen = null
      socket.onmessage = null
      socket.onclose = null
      socket.onerror = null
      socket.close(1000)
    }
  }
}
