import { describe, expect, it } from 'vitest'

import {
  createFallbackWaveformHeights,
  createWaveformHeights,
} from './useScenarioExampleAudio'

const createAudioBuffer = (segmentLevels: number[]) => {
  const samplesPerSegment = 1_000
  const channelData = new Float32Array(segmentLevels.length * samplesPerSegment)

  segmentLevels.forEach((level, segmentIndex) => {
    channelData.fill(level, segmentIndex * samplesPerSegment, (segmentIndex + 1) * samplesPerSegment)
  })

  return {
    length: channelData.length,
    numberOfChannels: 1,
    getChannelData: () => channelData,
  } as unknown as AudioBuffer
}

describe('createWaveformHeights', () => {
  it('작은 음량 차이도 서로 다른 막대 높이로 확장한다', () => {
    const audioBuffer = createAudioBuffer(
      Array.from({ length: 25 }, (_, index) => 0.01 + (index % 5) * 0.05),
    )

    const waveform = createWaveformHeights(audioBuffer)
    const distinctHeights = new Set(waveform.map((height) => height.toFixed(2)))

    expect(waveform).toHaveLength(25)
    expect(Math.min(...waveform)).toBeLessThanOrEqual(0.15)
    expect(Math.max(...waveform)).toBeGreaterThanOrEqual(0.99)
    expect(distinctHeights.size).toBeGreaterThanOrEqual(5)
  })

  it('무음은 최소 높이로 표시한다', () => {
    const waveform = createWaveformHeights(createAudioBuffer(Array(25).fill(0)))

    expect(waveform.every((height) => height === 0.14)).toBe(true)
  })
})

describe('createFallbackWaveformHeights', () => {
  it('음원 URL이 다르면 서로 다른 대체 파형을 만든다', () => {
    const firstWaveform = createFallbackWaveformHeights('https://example.com/first.mp3')
    const secondWaveform = createFallbackWaveformHeights('https://example.com/second.mp3')

    expect(firstWaveform).not.toEqual(secondWaveform)
    expect(createFallbackWaveformHeights('https://example.com/first.mp3')).toEqual(firstWaveform)
  })
})
