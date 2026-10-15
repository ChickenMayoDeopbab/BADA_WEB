/// <reference types="node" />
import source from './pcmProcessor.worklet.js?raw'
import { runInNewContext } from 'node:vm'
import { describe, expect, it } from 'vitest'

interface Processor {
  port: { onmessage: (event: { data: { enabled: boolean } }) => void }
  process: (inputs: Float32Array[][]) => boolean
}

/** 실제 Worklet 소스를 브라우저와 동일한 전역 계약으로 실행합니다. */
const createProcessor = (sampleRate: number) => {
  const chunks: ArrayBuffer[] = []
  let Constructor: new () => Processor
  class AudioWorkletProcessor {
    port = { postMessage: (data: ArrayBuffer) => chunks.push(data), onmessage: null }
  }
  runInNewContext(source, {
    sampleRate,
    AudioWorkletProcessor,
    Float32Array,
    ArrayBuffer,
    DataView,
    registerProcessor: (_name: string, constructor: new () => Processor) => {
      Constructor = constructor
    },
  })
  const processor = new Constructor!()
  processor.port.onmessage({ data: { enabled: true } })
  return { processor, chunks }
}

/** 오디오 렌더링 양자 경계와 관계없이 동일한 연속 신호를 입력합니다. */
const feedSignal = (processor: Processor, rate: number, seconds: number, frequency = 1000) => {
  const count = Math.round(rate * seconds)
  for (let offset = 0; offset < count; offset += 128) {
    const samples = Float32Array.from(
      { length: Math.min(128, count - offset) },
      (_, index) => 0.5 * Math.sin((2 * Math.PI * frequency * (offset + index)) / rate),
    )
    processor.process([[samples]])
  }
}

/** 리샘플링 결과의 RMS를 계산해 앨리어싱 억제를 확인합니다. */
const rms = (chunks: ArrayBuffer[]) => {
  const samples = chunks
    .flatMap((chunk) =>
      Array.from(
        { length: chunk.byteLength / 2 },
        (_, index) => new DataView(chunk).getInt16(index * 2, true) / 32768,
      ),
    )
    .slice(320)
  return Math.sqrt(samples.reduce((sum, sample) => sum + sample * sample, 0) / samples.length)
}

describe('microphone PCM worklet', () => {
  it.each([16000, 44100, 48000])(
    'produces exactly 16k mono PCM16 samples per second from %i Hz',
    (rate) => {
      const { processor, chunks } = createProcessor(rate)
      feedSignal(processor, rate, 1)
      expect(chunks).toHaveLength(50)
      expect(chunks.every((chunk) => chunk.byteLength === 640)).toBe(true)
      expect(rms(chunks)).toBeCloseTo(Math.sqrt(0.125), 2)
    },
  )

  it('filters frequencies above the output Nyquist limit before downsampling', () => {
    const { processor, chunks } = createProcessor(48000)
    feedSignal(processor, 48000, 1, 12000)
    expect(rms(chunks)).toBeLessThan(0.005)
  })

  it('discards partial microphone chunks and speaker echo across mute transitions', () => {
    const { processor, chunks } = createProcessor(48000)
    feedSignal(processor, 48000, 0.01)
    processor.port.onmessage({ data: { enabled: false } })
    feedSignal(processor, 48000, 1)
    expect(chunks).toHaveLength(0)
    processor.port.onmessage({ data: { enabled: true } })
    feedSignal(processor, 48000, 0.01)
    expect(chunks).toHaveLength(0)
    feedSignal(processor, 48000, 0.01)
    expect(chunks).toHaveLength(1)
  })
})
