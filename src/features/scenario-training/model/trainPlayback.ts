/** Raw PCM playback lifecycle. No React/native dependencies so races can be tested. */
export const TRAIN_SAMPLE_RATE = 16000
const PREBUFFER_FRAMES = TRAIN_SAMPLE_RATE / 4
const TAIL_MS = 300

export interface PlaybackStats {
  type: 'playback_stats'
  turn: number
  chunks: number
  played_ms?: number
  dropped_chunks: number
  // These counters avoid presenting JS callback timing as acoustic output timing.
  completed_played_ms: number
  invalid_bytes: number
  end_reason: string
}

export interface PlaybackDriver {
  enqueue: (samples: Float32Array, onEnded: () => void) => void
  clear: () => void
  idle: () => void
}
interface Turn {
  id: number
  completionTurnId: number | null
  chunks: number
  chunkEnds: number[]
  receivedBytes: number
  completedFrames: number
  pending: Float32Array[]
  pendingFrames: number
  outstanding: number
  started: boolean
  ended: boolean
  leftover: number | null
  invalidBytes: number
}
interface Options {
  driver: PlaybackDriver
  onBlocked: (blocked: boolean) => void
  onStats: (stats: PlaybackStats) => void
  onComplete?: (turnId: number) => void
  onError: (error: unknown) => void
  setTimer?: (callback: () => void, ms: number) => ReturnType<typeof setTimeout>
  clearTimer?: (timer: ReturnType<typeof setTimeout>) => void
}

export class TrainPlayback {
  private current: Turn | null = null
  private turns = new Set<Turn>()
  private nextTurn = 0
  private watchdog: ReturnType<typeof setTimeout> | null = null
  private generation = 0
  private isDisposed = false
  private tail: ReturnType<typeof setTimeout> | null = null
  private timer: NonNullable<Options['setTimer']>
  private cancelTimer: NonNullable<Options['clearTimer']>

  private options: Options

  /** 앱의 PCM 턴 관리 규칙을 브라우저 재생 드라이버와 연결합니다. */
  constructor(options: Options) {
    this.options = options
    this.timer = options.setTimer ?? ((callback, ms) => setTimeout(callback, ms))
    this.cancelTimer = options.clearTimer ?? ((timer) => clearTimeout(timer))
  }

  /** 모든 AI 턴과 잔향이 끝날 때까지 입력을 차단합니다. */
  private block() {
    if (this.isDisposed) return
    if (this.tail !== null) this.cancelTimer(this.tail)
    this.tail = null
    this.options.onBlocked(true)
  }

  /** emotion을 받으면 응답의 재생 구간을 시작합니다. */
  begin() {
    if (this.isDisposed) return
    this.block()
    if (this.isDisposed) return
    // Multiple emotion messages within an unfinished turn are metadata updates.
    if (this.current && !this.current.ended) return
    this.current = {
      id: this.nextTurn++,
      completionTurnId: null,
      chunks: 0,
      chunkEnds: [],
      receivedBytes: 0,
      completedFrames: 0,
      pending: [],
      pendingFrames: 0,
      outstanding: 0,
      started: false,
      ended: false,
      leftover: null,
      invalidBytes: 0,
    }
    this.turns.add(this.current)
    this.watch()
  }

  /** 프레임 경계의 홀수 바이트도 보존하며 PCM16 LE를 디코딩합니다. */
  push(data: ArrayBuffer) {
    if (this.isDisposed || !data.byteLength) return
    if (!this.current || this.current.ended) this.begin()
    this.block()
    if (this.isDisposed || !this.current) return
    const turn = this.current!
    turn.chunks++
    turn.receivedBytes += data.byteLength
    turn.chunkEnds.push(turn.receivedBytes)
    const backlog = [...this.turns].reduce(
      (bytes, t) => bytes + t.receivedBytes - t.completedFrames * 2,
      0,
    )
    if (backlog > TRAIN_SAMPLE_RATE * 2 * 60) {
      this.fail(new Error('PCM playback backlog exceeded 60 seconds'))
      return
    }
    this.watch()
    const bytes = new Uint8Array(data)
    const count = Math.floor((bytes.length + (turn.leftover === null ? 0 : 1)) / 2)
    const samples = new Float32Array(count)
    let offset = 0
    for (let i = 0; i < count; i++) {
      const low = turn.leftover ?? bytes[offset++]
      turn.leftover = null
      const sample = low | (bytes[offset++] << 8)
      samples[i] = (sample >= 0x8000 ? sample - 0x10000 : sample) / 32768
    }
    if (offset < bytes.length) turn.leftover = bytes[offset]
    if (!count) return
    turn.pending.push(samples)
    turn.pendingFrames += count
    if (turn.started || turn.pendingFrames >= PREBUFFER_FRAMES) this.flush(turn)
  }

  /** 전송 완료를 기록하고 아직 재생 중인 버퍼를 기다립니다. */
  end(completionTurnId?: number) {
    if (this.isDisposed) return
    if (!this.current && completionTurnId !== undefined) this.begin()
    const turn = this.current
    if (!turn || turn.ended) return
    if (completionTurnId !== undefined) turn.completionTurnId = completionTurnId
    turn.ended = true
    // A partial sample must never leak into the following turn.
    if (turn.leftover !== null) {
      turn.invalidBytes++
      this.fail(new Error('PCM incomplete sample'))
      return
    }
    turn.leftover = null
    this.flush(turn)
    this.finish(turn)
  }

  /** 초기 버퍼와 뒤따르는 청크를 재생 순서대로 예약합니다. */
  private flush(turn: Turn) {
    if (!turn.pendingFrames) return
    // One native buffer for the initial prebuffer, then enqueue incoming PCM directly.
    const samples =
      turn.pending.length === 1 ? turn.pending[0] : new Float32Array(turn.pendingFrames)
    if (turn.pending.length > 1) {
      let offset = 0
      for (const part of turn.pending) {
        samples.set(part, offset)
        offset += part.length
      }
    }
    turn.pending = []
    turn.pendingFrames = 0
    turn.started = true
    turn.outstanding++
    const generation = this.generation
    let completed = false
    try {
      this.options.driver.enqueue(samples, () => {
        if (completed || generation !== this.generation) return
        completed = true
        turn.outstanding--
        turn.completedFrames += samples.length
        this.finish(turn)
        this.watch()
      })
    } catch (error) {
      this.fail(error)
    }
  }

  /** 완료된 샘플로 재생 통계를 계산합니다. */
  private stats(turn: Turn, reason: string): PlaybackStats {
    const completedBytes = turn.completedFrames * 2
    return {
      type: 'playback_stats',
      turn: turn.id,
      chunks: turn.chunks,
      ...(reason === 'completed' ? { played_ms: turn.completedFrames / 16 } : {}),
      completed_played_ms: turn.completedFrames / 16,
      dropped_chunks: turn.chunkEnds.filter((end) => end > completedBytes).length,
      invalid_bytes: turn.invalidBytes,
      end_reason: reason,
    }
  }

  /** 해당 턴의 모든 오디오 출력이 끝나면 완료 응답을 보냅니다. */
  private finish(turn: Turn) {
    if (!this.turns.has(turn) || !turn.ended || turn.pendingFrames || turn.outstanding) return
    this.turns.delete(turn)
    this.watch()
    this.options.onStats(this.stats(turn, 'completed'))
    if (turn.completionTurnId !== null) {
      this.options.onComplete?.(turn.completionTurnId)
    }
    this.release()
  }

  /** 전송 완료나 실제 출력 완료가 누락되면 안전하게 실패합니다. */
  private watch() {
    if (this.watchdog !== null) this.cancelTimer(this.watchdog)
    this.watchdog = null
    if (!this.turns.size) return
    const remainingMs = [...this.turns].reduce(
      (ms, t) => ms + t.receivedBytes / 32 - t.completedFrames / 16,
      0,
    )
    this.watchdog = this.timer(() => {
      this.watchdog = null
      this.fail(new Error('PCM playback or speaking_end timed out'))
    }, remainingMs + 15000)
  }

  /** 다음 턴이 없을 때 300ms 잔향 이후 입력을 재개합니다. */
  private release() {
    if (this.isDisposed || this.turns.size || this.tail !== null) return
    const generation = this.generation
    this.tail = this.timer(() => {
      this.tail = null
      if (generation !== this.generation || this.turns.size) return
      this.options.driver.idle()
      this.options.onBlocked(false)
    }, TAIL_MS)
  }

  /** 명시적인 중단에만 재생을 정지하고 오래된 콜백을 무효화합니다. */
  reset(reason = 'interrupt') {
    this.generation++
    if (this.watchdog !== null) this.cancelTimer(this.watchdog)
    this.watchdog = null
    if (this.tail !== null) this.cancelTimer(this.tail)
    this.tail = null
    this.options.driver.clear()
    for (const turn of this.turns) this.options.onStats(this.stats(turn, reason))
    this.turns.clear()
    this.current = null
    // Even an interrupt leaves a short speaker tail.
    this.release()
  }

  /** 오디오 오류에서 큐를 비우고 통화 제어기에 전달합니다. */
  fail(error: unknown) {
    this.reset('playback_error')
    this.options.onError(error)
  }

  /** 통화 종료 시 큐와 모든 타이머를 제거합니다. */
  dispose() {
    if (this.isDisposed) return
    this.isDisposed = true
    this.reset('disposed')
    if (this.tail !== null) this.cancelTimer(this.tail)
    this.tail = null
  }
}
