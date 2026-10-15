import { useEffect, useRef } from 'react'

/** 중복 재생을 막고 패널을 닫거나 다른 기록으로 이동할 때 전체 녹음을 정지합니다. */
export const useFullRecording = (
  isSegmentPlaying: boolean,
  isVisible: boolean,
  audioUrl?: string,
) => {
  const audioRef = useRef<HTMLAudioElement>(null)
  useEffect(() => {
    if (isSegmentPlaying) audioRef.current?.pause()
  }, [isSegmentPlaying])
  useEffect(() => {
    const audio = audioRef.current
    return () => audio?.pause()
  }, [isVisible, audioUrl])
  return audioRef
}
