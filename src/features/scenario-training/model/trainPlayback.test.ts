import { TrainPlayback } from './trainPlayback'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

/** 실제 출력 완료를 테스트가 제어하는 오디오 드라이버를 제공합니다. */
const createPlayback = () => {
  const pending: Array<{ samples: Float32Array; end: () => void }> = []
  const onBlocked = vi.fn()
  const onComplete = vi.fn()
  const onError = vi.fn()
  const clear = vi.fn()
  const playback = new TrainPlayback({
    driver: { enqueue: (samples, end) => pending.push({ samples, end }), clear, idle: vi.fn() },
    onBlocked,
    onComplete,
    onError,
    onStats: vi.fn(),
  })
  return { playback, pending, onBlocked, onComplete, onError, clear }
}

describe('AI PCM playback lifecycle', () => {
  beforeEach(() => vi.useFakeTimers())
  afterEach(() => vi.useRealTimers())

  it('does not unblock on speaking_end or buffer underrun, and acks actual output completion', () => {
    const { playback, pending, onBlocked, onComplete } = createPlayback()
    playback.begin()
    playback.push(new ArrayBuffer(8000))
    pending[0].end()
    expect(onBlocked).toHaveBeenLastCalledWith(true)
    playback.push(new ArrayBuffer(640))
    playback.end(7)
    expect(onComplete).not.toHaveBeenCalled()
    pending[1].end()
    expect(onComplete).toHaveBeenCalledExactlyOnceWith(7)
    vi.advanceTimersByTime(299)
    expect(onBlocked).toHaveBeenLastCalledWith(true)
    vi.advanceTimersByTime(1)
    expect(onBlocked).toHaveBeenLastCalledWith(false)
    playback.dispose()
  })

  it('keeps the microphone blocked across overlapping turns and speaker tails', () => {
    const { playback, pending, onBlocked, onComplete } = createPlayback()
    playback.push(new ArrayBuffer(8000))
    playback.end(1)
    playback.begin()
    playback.push(new ArrayBuffer(640))
    playback.end(2)
    pending[0].end()
    vi.advanceTimersByTime(500)
    expect(onBlocked).toHaveBeenLastCalledWith(true)
    pending[1].end()
    vi.advanceTimersByTime(300)
    expect(onComplete.mock.calls).toEqual([[1], [2]])
    expect(onBlocked).toHaveBeenLastCalledWith(false)
    playback.dispose()
  })

  it('reassembles PCM16 samples split across binary frame boundaries', () => {
    const { playback, pending } = createPlayback()
    playback.push(new Uint8Array([0, 128, 255]).buffer)
    playback.push(new Uint8Array([127]).buffer)
    playback.end(3)
    expect([...pending[0].samples]).toEqual([-1, 32767 / 32768])
    playback.dispose()
  })

  it('fails a truncated PCM sample without enabling the microphone', () => {
    const { playback, onError, onComplete } = createPlayback()
    playback.push(new Uint8Array([1]).buffer)
    playback.end(3)
    expect(onError).toHaveBeenCalledOnce()
    expect(onComplete).not.toHaveBeenCalled()
    playback.dispose()
  })

  it('ignores old onended callbacks after interrupt and disposes every timer', () => {
    const { playback, pending, onComplete, clear } = createPlayback()
    playback.push(new ArrayBuffer(8000))
    playback.end(1)
    playback.reset()
    playback.begin()
    pending[0].end()
    expect(onComplete).not.toHaveBeenCalled()
    playback.dispose()
    expect(clear).toHaveBeenCalled()
    expect(vi.getTimerCount()).toBe(0)
  })

  it('times out a missing speaking_end rather than guessing that a turn finished', () => {
    const { playback, pending, onError } = createPlayback()
    playback.push(new ArrayBuffer(8000))
    pending[0].end()
    vi.advanceTimersByTime(15001)
    expect(onError).toHaveBeenCalledOnce()
    playback.dispose()
  })

  it('cannot create another playback watchdog if blocking synchronously disposes the call', () => {
    const enqueue = vi.fn()
    const playback: TrainPlayback = new TrainPlayback({
      driver: { enqueue, clear: vi.fn(), idle: vi.fn() },
      onBlocked: () => playback.dispose(),
      onComplete: vi.fn(),
      onStats: vi.fn(),
      onError: vi.fn(),
    })
    playback.push(new ArrayBuffer(8000))
    expect(enqueue).not.toHaveBeenCalled()
    expect(vi.getTimerCount()).toBe(0)
  })
})
