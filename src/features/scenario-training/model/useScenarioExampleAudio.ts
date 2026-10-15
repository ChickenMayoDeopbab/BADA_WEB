import { useEffect, useRef, useState } from 'react'

import { getScenarioExampleAudioBuffer } from '../api/scenarioTrainingApi'

const waveformBarCount = 25
const fallbackWaveformHeights = [
  0.27, 0.7, 0.95, 0.59, 0.82, 0.45, 0.86, 0.66, 0.39, 0.32, 0.52, 0.93, 1, 0.91, 0.8,
  0.73, 0.61, 0.86, 0.91, 0.77, 0.5, 0.7, 0.43, 0.64, 0.36,
]

/** 분석 전 또는 분석 실패 시에도 음원별로 구분되는 안정적인 대체 파형을 만듭니다. */
export const createFallbackWaveformHeights = (audioUrl?: string) => {
  if (!audioUrl) return fallbackWaveformHeights

  let seed = Array.from(audioUrl).reduce(
    (hash, character) => Math.imul(hash ^ character.charCodeAt(0), 16_777_619),
    2_166_136_261,
  )

  return fallbackWaveformHeights.map((height) => {
    seed = Math.imul(seed ^ (seed >>> 15), 2_246_822_519)
    const randomRatio = (seed >>> 0) / 4_294_967_295

    return Math.min(1, Math.max(0.14, height * (0.72 + randomRatio * 0.55)))
  })
}

/** 디코딩된 음원을 구간별 RMS 데시벨 파형으로 변환합니다. */
export const createWaveformHeights = (audioBuffer: AudioBuffer) => {
  const decibelLevels = Array.from({ length: waveformBarCount }, (_, barIndex) => {
    const start = Math.floor((audioBuffer.length * barIndex) / waveformBarCount)
    const end = Math.floor((audioBuffer.length * (barIndex + 1)) / waveformBarCount)
    const sampleStep = Math.max(1, Math.floor((end - start) / 1_500))
    let squaredTotal = 0
    let sampleCount = 0

    for (let channel = 0; channel < audioBuffer.numberOfChannels; channel += 1) {
      const channelData = audioBuffer.getChannelData(channel)
      for (let sample = start; sample < end; sample += sampleStep) {
        squaredTotal += channelData[sample] ** 2
        sampleCount += 1
      }
    }

    const rms = sampleCount > 0 ? Math.sqrt(squaredTotal / sampleCount) : 0

    return 20 * Math.log10(Math.max(rms, 0.00001))
  })
  const sortedLevels = [...decibelLevels].sort((left, right) => left - right)
  const quietLevel = sortedLevels[Math.floor((sortedLevels.length - 1) * 0.15)]
  const loudLevel = sortedLevels[Math.ceil((sortedLevels.length - 1) * 0.9)]
  const dynamicRange = Math.max(1, loudLevel - quietLevel)

  return decibelLevels.map((level) => {
    const normalizedLevel = Math.min(1, Math.max(0, (level - quietLevel) / dynamicRange))

    return 0.14 + normalizedLevel * 0.86
  })
}

/** 시나리오 예시 음성의 재생 시간과 진행 상태를 관리합니다. */
export const useScenarioExampleAudio = (audioUrl?: string) => {
  const audioRef = useRef<HTMLAudioElement>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [duration, setDuration] = useState(0)
  const [currentTime, setCurrentTime] = useState(0)
  const [hasPlaybackError, setHasPlaybackError] = useState(false)
  const [waveformResult, setWaveformResult] = useState(() => ({
    audioUrl,
    heights: createFallbackWaveformHeights(audioUrl),
  }))
  const waveformHeights =
    waveformResult.audioUrl === audioUrl
      ? waveformResult.heights
      : createFallbackWaveformHeights(audioUrl)

  useEffect(() => {
    if (!audioUrl || typeof window.AudioContext === 'undefined') return

    const controller = new AbortController()
    const audioContext = new window.AudioContext()

    /** 음원 파일을 디코딩해 실제 음량 파형을 계산합니다. */
    const loadWaveform = async () => {
      try {
        const arrayBuffer = await getScenarioExampleAudioBuffer(audioUrl, controller.signal)
        const audioBuffer = await audioContext.decodeAudioData(arrayBuffer)
        setWaveformResult({ audioUrl, heights: createWaveformHeights(audioBuffer) })
      } catch (error) {
        if (error instanceof DOMException && error.name === 'AbortError') return
      }
    }

    void loadWaveform()

    return () => {
      controller.abort()
      void audioContext.close()
    }
  }, [audioUrl])

  /** 음성 메타데이터에서 전체 재생 시간을 저장합니다. */
  const handleLoadedMetadata = () => {
    const audio = audioRef.current
    if (!audio || !Number.isFinite(audio.duration)) return
    setDuration(audio.duration)
  }

  /** 재생 위치와 파형 진행률을 동기화합니다. */
  const handleTimeUpdate = () => {
    const audio = audioRef.current
    if (!audio) return
    setCurrentTime(audio.currentTime)
  }

  /** 음성 재생이 끝나면 버튼 상태를 초기화합니다. */
  const handleEnded = () => {
    setIsPlaying(false)
    setCurrentTime(duration)
  }

  /** 음성 파일을 불러오지 못하면 재생 상태를 오류로 전환합니다. */
  const handlePlaybackError = () => {
    setIsPlaying(false)
    setHasPlaybackError(true)
  }

  /** 예시 음성의 재생과 일시정지를 전환합니다. */
  const handleToggle = async () => {
    const audio = audioRef.current
    if (!audioUrl || !audio) return

    setHasPlaybackError(false)
    if (isPlaying) {
      audio.pause()
      setIsPlaying(false)
      return
    }

    if (duration > 0 && audio.currentTime >= duration) audio.currentTime = 0
    try {
      await audio.play()
      setIsPlaying(true)
    } catch {
      handlePlaybackError()
    }
  }

  return {
    audioRef,
    isPlaying,
    duration,
    progress: duration > 0 ? Math.min(1, currentTime / duration) : 0,
    waveformHeights,
    hasPlaybackError,
    handleLoadedMetadata,
    handleTimeUpdate,
    handleEnded,
    handlePlaybackError,
    handleToggle,
  }
}
