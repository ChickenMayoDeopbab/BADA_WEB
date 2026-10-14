import { VoiceCall, type VoiceCallState } from './voiceCall'
import type { VoiceServerMessage } from './voiceProtocol'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => ({
  audioOptions: null as null | {
    onPcm: (data: ArrayBuffer) => void
    onBlocked: (blocked: boolean) => void
    onSuspended: (suspended: boolean) => void
  },
  transportOptions: null as null | {
    onMessage: (message: VoiceServerMessage) => void
    onError: (error: unknown) => void
  },
  prepare: vi.fn<() => Promise<void>>(),
  audioDispose: vi.fn(),
  transportDispose: vi.fn(),
  sendJson: vi.fn<(payload: object) => boolean>(),
  sendBinary: vi.fn(),
  setCaptureEnabled: vi.fn(),
  connect: vi.fn(),
}))

vi.mock('./voiceAudio', () => ({
  VoiceAudio: class {
    playback = { begin: vi.fn(), push: vi.fn(), end: vi.fn(), reset: vi.fn() }
    prepare = mocks.prepare
    dispose = mocks.audioDispose
    setCaptureEnabled = mocks.setCaptureEnabled
    resume = vi.fn()
    constructor(options: typeof mocks.audioOptions) {
      mocks.audioOptions = options
    }
  },
}))
vi.mock('./voiceTransport', () => ({
  VoiceTransport: class {
    connect = mocks.connect
    dispose = mocks.transportDispose
    sendJson = mocks.sendJson
    sendBinary = mocks.sendBinary
    constructor(options: typeof mocks.transportOptions) {
      mocks.transportOptions = options
    }
  },
}))

/** 통화 상태를 수집하는 오디오·연결 제어기 테스트 하네스를 만듭니다. */
const createCall = () => {
  const states: VoiceCallState[] = []
  const call = new VoiceCall({
    sessionId: 'session',
    getToken: vi.fn(),
    onState: (state) => states.push(state),
  })
  return { call, states }
}

describe('voice call coordination', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.clearAllMocks()
    mocks.prepare.mockResolvedValue()
    mocks.sendJson.mockReturnValue(true)
  })
  afterEach(() => vi.useRealTimers())

  it('starts its timer only after audio readiness and server authentication', async () => {
    const { call, states } = createCall()
    await call.start()
    expect(states.at(-1)?.stage).toBe('connecting')
    expect(states.at(-1)?.startedAt).toBeNull()
    vi.advanceTimersByTime(1500)
    mocks.transportOptions!.onMessage({ type: 'scenario_info', aiRole: '상담사' })
    expect(states.at(-1)?.startedAt).toBe(Date.now())
    expect(mocks.setCaptureEnabled).toHaveBeenLastCalledWith(true)
    call.dispose()
    expect(vi.getTimerCount()).toBe(0)
  })

  it('combines user mute, AI playback and suspended audio without leaking microphone data', async () => {
    const { call } = createCall()
    await call.start()
    mocks.transportOptions!.onMessage({ type: 'scenario_info', aiRole: '' })
    mocks.audioOptions!.onPcm(new ArrayBuffer(640))
    expect(mocks.sendBinary).toHaveBeenCalledOnce()
    mocks.audioOptions!.onBlocked(true)
    mocks.audioOptions!.onPcm(new ArrayBuffer(640))
    expect(mocks.sendBinary).toHaveBeenCalledOnce()
    call.toggleMute()
    mocks.audioOptions!.onBlocked(false)
    expect(mocks.sendJson).toHaveBeenLastCalledWith({ type: 'mute', muted: true })
    call.toggleMute()
    mocks.audioOptions!.onSuspended(true)
    mocks.audioOptions!.onPcm(new ArrayBuffer(640))
    expect(mocks.sendBinary).toHaveBeenCalledOnce()
    mocks.audioOptions!.onSuspended(false)
    mocks.audioOptions!.onPcm(new ArrayBuffer(640))
    expect(mocks.sendBinary).toHaveBeenCalledTimes(2)
    call.dispose()
  })

  it('sends mute only on gate changes and does not rerender for each AI audio chunk', async () => {
    const { call, states } = createCall()
    await call.start()
    mocks.transportOptions!.onMessage({ type: 'scenario_info', aiRole: '직원' })
    expect(mocks.sendJson).toHaveBeenLastCalledWith({ type: 'mute', muted: false })
    mocks.audioOptions!.onBlocked(true)
    const stateCount = states.length
    for (let index = 0; index < 20; index += 1) mocks.audioOptions!.onBlocked(true)
    expect(states).toHaveLength(stateCount)
    expect(mocks.sendJson.mock.calls.map(([payload]) => payload)).toEqual([
      { type: 'mute', muted: false },
      { type: 'mute', muted: true },
    ])
    call.toggleMute()
    mocks.audioOptions!.onBlocked(false)
    expect(mocks.sendJson).toHaveBeenCalledTimes(2)
    mocks.audioOptions!.onPcm(new ArrayBuffer(640))
    expect(mocks.sendBinary).not.toHaveBeenCalled()
    call.toggleMute()
    expect(mocks.sendJson).toHaveBeenLastCalledWith({ type: 'mute', muted: false })
    mocks.audioOptions!.onPcm(new ArrayBuffer(640))
    expect(mocks.sendBinary).toHaveBeenCalledOnce()
    call.dispose()
  })

  it('ignores duplicate starts and a microphone promise that resolves after ending', async () => {
    let resolve!: () => void
    mocks.prepare.mockReturnValue(
      new Promise<void>((done) => {
        resolve = done
      }),
    )
    const { call, states } = createCall()
    const start = call.start()
    await call.start()
    call.end()
    resolve()
    await start
    expect(mocks.prepare).toHaveBeenCalledOnce()
    expect(mocks.connect).not.toHaveBeenCalled()
    expect(states.at(-1)?.stage).toBe('ended')
    expect(vi.getTimerCount()).toBe(0)
    call.dispose()
  })

  it('stops audio immediately but waits for server end acknowledgement before showing success', async () => {
    const { call, states } = createCall()
    await call.start()
    mocks.transportOptions!.onMessage({ type: 'scenario_info', aiRole: '' })
    vi.advanceTimersByTime(2700)
    call.end()
    expect(states.at(-1)?.stage).toBe('ending')
    expect(states.at(-1)?.durationSeconds).toBe(2)
    expect(mocks.audioDispose).toHaveBeenCalled()
    mocks.transportOptions!.onMessage({ type: 'end', reason: 'USER_END' })
    expect(states.at(-1)?.stage).toBe('ended')
    expect(vi.getTimerCount()).toBe(0)
    call.dispose()
  })

  it('shows an error rather than a successful training result if the server disconnects', async () => {
    const { call, states } = createCall()
    await call.start()
    mocks.transportOptions!.onError(new Error('WS_CLOSED'))
    expect(states.at(-1)?.stage).toBe('error')
    expect(states.at(-1)?.errorMessage).toContain('연결이 끊어졌어요')
    expect(mocks.audioDispose).toHaveBeenCalled()
    expect(mocks.transportDispose).toHaveBeenCalled()
    call.dispose()
  })

  it('never replaces a synchronous end-send failure with a successful result', async () => {
    const { call, states } = createCall()
    await call.start()
    mocks.transportOptions!.onMessage({ type: 'scenario_info', aiRole: '' })
    mocks.sendJson.mockImplementation((payload) => {
      if ('type' in payload && payload.type === 'end') {
        mocks.transportOptions!.onError(new Error('WS_SEND_FAILED'))
        return false
      }
      return true
    })
    call.end()
    expect(states.at(-1)?.stage).toBe('error')
    expect(states.some((state) => state.stage === 'ended')).toBe(false)
    expect(vi.getTimerCount()).toBe(0)
    call.dispose()
  })

  it('retains the server hint level until the next hint and resets hints for a new call', async () => {
    const { call, states } = createCall()
    await call.start()
    mocks.transportOptions!.onMessage({ type: 'scenario_info', aiRole: '', scriptLevel: 1 })
    expect(states.at(-1)?.scriptHint).toBeNull()
    mocks.transportOptions!.onMessage({
      type: 'script_hint',
      level: 1,
      text: '  내일 두 명 예약하고 싶어요.  ',
    })
    expect(states.at(-1)?.scriptHint).toEqual({ level: 1, text: '내일 두 명 예약하고 싶어요.' })
    mocks.transportOptions!.onMessage({ type: 'transcript', role: 'ai', text: '어느 시간인가요?' })
    expect(states.at(-1)?.scriptHint?.level).toBe(1)
    mocks.transportOptions!.onMessage({
      type: 'script_hint',
      level: 2,
      text: '원하는 시간을 말해보세요.',
    })
    expect(states.at(-1)?.scriptHint).toEqual({ level: 2, text: '원하는 시간을 말해보세요.' })
    mocks.transportOptions!.onMessage({ type: 'script_hint', level: 3, text: '' })
    expect(states.at(-1)?.scriptHint).toEqual({ level: 3, text: '' })
    call.dispose()
    const next = createCall()
    await next.call.start()
    expect(next.states.at(-1)?.scriptHint).toBeNull()
    next.call.dispose()
  })
})
