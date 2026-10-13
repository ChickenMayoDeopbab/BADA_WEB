import { VoiceTransport } from './voiceTransport'
import { env } from '@shared/config'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

/** 서버가 전송한 프레임과 브라우저 연결 수명을 제어합니다. */
class FakeSocket {
  static OPEN = 1
  static instances: FakeSocket[] = []
  readyState = 1
  bufferedAmount = 0
  binaryType = ''
  url: string
  onopen: (() => void) | null = null
  onmessage: ((event: { data: unknown }) => void) | null = null
  onclose: ((event: { code: number; reason: string }) => void) | null = null
  onerror: (() => void) | null = null
  send = vi.fn()
  close = vi.fn()
  /** 연결 URL만 저장하고 네트워크를 사용하지 않습니다. */
  constructor(url: string) {
    this.url = url
    FakeSocket.instances.push(this)
  }
}

/** 토큰 갱신과 서버 메시지 콜백을 추적합니다. */
const createTransport = () => {
  const getToken = vi.fn<(refresh?: boolean) => Promise<string>>().mockResolvedValue('secret')
  const onMessage = vi.fn()
  const onBinary = vi.fn()
  const onError = vi.fn()
  const onClosed = vi.fn()
  const transport = new VoiceTransport({
    sessionId: 'session/with space',
    getToken,
    onMessage,
    onBinary,
    onError,
    onClosed,
  })
  return { transport, getToken, onMessage, onBinary, onError, onClosed }
}

describe('voice transport', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.stubGlobal('WebSocket', FakeSocket)
    FakeSocket.instances = []
  })
  afterEach(() => {
    vi.useRealTimers()
    vi.unstubAllGlobals()
    Object.assign(env, { voiceAuthMode: 'frame' })
  })

  it('authenticates with the first frame and waits for scenario_info before accepting PCM', async () => {
    const { transport, onBinary } = createTransport()
    await transport.connect()
    const socket = FakeSocket.instances[0]
    expect(new URL(socket.url).search).toBe('')
    expect(socket.url).toContain('/ws/voice/session%2Fwith%20space')
    socket.onopen?.()
    expect(socket.send.mock.calls.map(([frame]) => JSON.parse(frame))).toEqual([
      { type: 'auth', token: 'secret' },
      { type: 'playback_capabilities', completion_ack: true },
    ])
    transport.sendBinary(new ArrayBuffer(640))
    expect(socket.send).toHaveBeenCalledTimes(2)
    socket.onmessage?.({ data: JSON.stringify({ type: 'scenario_info', aiRole: '직원' }) })
    transport.sendBinary(new ArrayBuffer(640))
    socket.onmessage?.({ data: new ArrayBuffer(640) })
    expect(onBinary).toHaveBeenCalledOnce()
    transport.dispose()
    expect(vi.getTimerCount()).toBe(0)
  })

  it('supports the existing app query authentication when explicitly configured', async () => {
    Object.assign(env, { voiceAuthMode: 'query' })
    const { transport } = createTransport()
    await transport.connect()
    const socket = FakeSocket.instances[0]
    expect(new URL(socket.url).searchParams.get('token')).toBe('secret')
    socket.onopen?.()
    expect(socket.send.mock.calls.map(([frame]) => JSON.parse(frame))).toEqual([
      { type: 'playback_capabilities', completion_ack: true },
    ])
    transport.dispose()
  })

  it('refreshes an expired handshake once and does not reconnect an active session', async () => {
    const { transport, getToken, onError } = createTransport()
    await transport.connect()
    FakeSocket.instances[0].onclose?.({ code: 1008, reason: 'TOKEN_EXPIRED' })
    await Promise.resolve()
    expect(getToken).toHaveBeenLastCalledWith(true)
    const socket = FakeSocket.instances[1]
    socket.onmessage?.({ data: JSON.stringify({ type: 'scenario_info', aiRole: '' }) })
    socket.onclose?.({ code: 1008, reason: 'TOKEN_EXPIRED' })
    expect(FakeSocket.instances).toHaveLength(2)
    expect(onError).toHaveBeenCalledOnce()
    expect(vi.getTimerCount()).toBe(0)
  })

  it('does not open a socket when token refresh resolves after navigation', async () => {
    const { transport, getToken } = createTransport()
    let resolve!: (token: string) => void
    getToken.mockReturnValue(
      new Promise<string>((done) => {
        resolve = done
      }),
    )
    const connection = transport.connect()
    transport.dispose()
    resolve('late-secret')
    await connection
    expect(FakeSocket.instances).toHaveLength(0)
    expect(vi.getTimerCount()).toBe(0)
  })

  it('fails safely on malformed audio messages and cleans both socket and timers', async () => {
    const { transport, onError } = createTransport()
    await transport.connect()
    const socket = FakeSocket.instances[0]
    socket.onopen?.()
    socket.onmessage?.({ data: '{broken JSON' })
    expect(onError).toHaveBeenCalledOnce()
    expect(socket.close).toHaveBeenCalledOnce()
    expect(vi.getTimerCount()).toBe(0)
  })

  it('limits microphone send backlog rather than accumulating stale voice', async () => {
    const { transport, onError } = createTransport()
    await transport.connect()
    const socket = FakeSocket.instances[0]
    socket.onmessage?.({ data: JSON.stringify({ type: 'scenario_info', aiRole: '' }) })
    socket.bufferedAmount = 64001
    transport.sendBinary(new ArrayBuffer(640))
    expect(onError).toHaveBeenCalledWith(expect.objectContaining({ message: 'WS_BACKPRESSURE' }))
  })

  it('times out sockets that open without completing authentication', async () => {
    const { transport, onError } = createTransport()
    await transport.connect()
    FakeSocket.instances[0].onopen?.()
    vi.advanceTimersByTime(20001)
    expect(onError).toHaveBeenCalledWith(expect.objectContaining({ message: 'WS_TIMEOUT' }))
    expect(vi.getTimerCount()).toBe(0)
  })
})
