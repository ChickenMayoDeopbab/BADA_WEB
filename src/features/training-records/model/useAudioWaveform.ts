import { useEffect, useState } from 'react'

const WAVEFORM_BAR_COUNT = 25
const MINIMUM_BAR_RATIO = 0.18
const MAXIMUM_CACHED_AUDIO_COUNT = 5
const FALLBACK_WAVEFORM = [
  0.27, 0.7, 0.95, 0.59, 0.82, 0.45, 0.86, 0.66, 0.39, 0.32, 0.52, 0.93, 1, 0.91, 0.8, 0.73, 0.61,
  0.86, 0.91, 0.77, 0.5, 0.7, 0.43, 0.64, 0.36,
]
const audioBufferCache = new Map<string, Promise<AudioBuffer>>()

// 같은 녹음 파일을 피드백마다 다시 내려받지 않도록 디코딩 결과를 공유합니다.
const loadAudioBuffer = (audioUrl: string) => {
  const cachedAudioBuffer = audioBufferCache.get(audioUrl)
  if (cachedAudioBuffer) return cachedAudioBuffer

  const audioBufferPromise = (async () => {
    const audioContext = new window.AudioContext()

    try {
      const response = await fetch(audioUrl)
      if (!response.ok) throw new Error('음성 파일을 불러오지 못했습니다.')

      return await audioContext.decodeAudioData(await response.arrayBuffer())
    } finally {
      if (audioContext.state !== 'closed') {
        await audioContext.close().catch(() => undefined)
      }
    }
  })().catch((error: unknown) => {
    audioBufferCache.delete(audioUrl)
    throw error
  })

  if (audioBufferCache.size >= MAXIMUM_CACHED_AUDIO_COUNT) {
    const oldestAudioUrl = audioBufferCache.keys().next().value
    if (oldestAudioUrl) audioBufferCache.delete(oldestAudioUrl)
  }
  audioBufferCache.set(audioUrl, audioBufferPromise)

  return audioBufferPromise
}

// 녹음 구간의 채널별 진폭을 막대 단위 RMS 값으로 변환합니다.
const createWaveform = (
  audioBuffer: AudioBuffer,
  startSecond: number,
  endSecond: number,
): number[] => {
  const startSample = Math.max(0, Math.floor(startSecond * audioBuffer.sampleRate))
  const requestedEndSample = Math.ceil(endSecond * audioBuffer.sampleRate)
  const endSample = Math.min(audioBuffer.length, Math.max(startSample + 1, requestedEndSample))
  const bucketSize = Math.max(1, Math.floor((endSample - startSample) / WAVEFORM_BAR_COUNT))

  const amplitudes = Array.from({ length: WAVEFORM_BAR_COUNT }, (_, bucketIndex) => {
    const bucketStart = startSample + bucketIndex * bucketSize
    const bucketEnd = Math.min(endSample, bucketStart + bucketSize)
    const sampleStep = Math.max(1, Math.floor((bucketEnd - bucketStart) / 400))
    let squaredAmplitudeSum = 0
    let sampleCount = 0

    for (let channelIndex = 0; channelIndex < audioBuffer.numberOfChannels; channelIndex += 1) {
      const channelData = audioBuffer.getChannelData(channelIndex)

      for (let sampleIndex = bucketStart; sampleIndex < bucketEnd; sampleIndex += sampleStep) {
        const amplitude = channelData[sampleIndex] ?? 0
        squaredAmplitudeSum += amplitude * amplitude
        sampleCount += 1
      }
    }

    return sampleCount > 0 ? Math.sqrt(squaredAmplitudeSum / sampleCount) : 0
  })

  const maximumAmplitude = Math.max(...amplitudes)
  if (maximumAmplitude <= 0) return FALLBACK_WAVEFORM

  return amplitudes.map((amplitude) =>
    Math.max(MINIMUM_BAR_RATIO, Math.sqrt(amplitude / maximumAmplitude)),
  )
}

// 실제 녹음 파일을 분석해 선택한 피드백 구간의 파형 높이를 반환합니다.
export const useAudioWaveform = (
  audioUrl: string | undefined,
  startSecond: number,
  endSecond: number,
) => {
  const waveformKey = `${audioUrl ?? ''}:${startSecond}:${endSecond}`
  const [waveformResult, setWaveformResult] = useState<{
    key: string
    waveform: number[]
  } | null>(null)

  useEffect(() => {
    if (!audioUrl || endSecond <= startSecond || !window.AudioContext) {
      return
    }

    let isCancelled = false

    const loadWaveform = async () => {
      try {
        const audioBuffer = await loadAudioBuffer(audioUrl)
        if (!isCancelled) {
          setWaveformResult({
            key: waveformKey,
            waveform: createWaveform(audioBuffer, startSecond, endSecond),
          })
        }
      } catch {
        // 파형 분석에 실패해도 기본 파형으로 음성 재생은 계속 제공합니다.
      }
    }

    void loadWaveform()

    return () => {
      isCancelled = true
    }
  }, [audioUrl, endSecond, startSecond, waveformKey])

  return waveformResult?.key === waveformKey ? waveformResult.waveform : FALLBACK_WAVEFORM
}
