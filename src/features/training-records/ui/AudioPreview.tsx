import waveform from '@shared/assets/training-records/waveform.svg'
import { useEffect, useRef, useState } from 'react'

interface AudioPreviewProps {
  isPlaying: boolean
  audioUrl?: string
  startSecond: number
  endSecond: number
  onToggle: () => void
}

// 선택한 피드백 구간의 녹음 음성을 재생합니다.
export const AudioPreview = ({
  isPlaying,
  audioUrl,
  startSecond,
  endSecond,
  onToggle,
}: AudioPreviewProps) => {
  const audioRef = useRef<HTMLAudioElement>(null)
  const onToggleRef = useRef(onToggle)
  const [progress, setProgress] = useState(0)
  const [hasPlaybackError, setHasPlaybackError] = useState(false)
  const segmentStart = Math.max(0, startSecond)
  const segmentEnd = Math.max(segmentStart, endSecond)
  const segmentDuration = segmentEnd - segmentStart
  const hasPlayableAudio = Boolean(audioUrl && segmentDuration > 0)

  useEffect(() => {
    onToggleRef.current = onToggle
  }, [onToggle])

  useEffect(() => {
    const audio = audioRef.current
    if (!audio || !audioUrl) return

    if (isPlaying) {
      void audio.play().catch(() => {
        setHasPlaybackError(true)
        onToggleRef.current()
      })
    } else {
      audio.pause()
    }
  }, [audioUrl, isPlaying])

  // 현재 재생 위치를 피드백 구간 진행률로 갱신하고 구간 끝에서 멈춥니다.
  const handleTimeUpdate = () => {
    const audio = audioRef.current
    if (!audio || segmentDuration <= 0) return

    const nextProgress = Math.min(
      1,
      Math.max(0, (audio.currentTime - segmentStart) / segmentDuration),
    )
    setProgress(nextProgress)

    if (isPlaying && audio.currentTime >= segmentEnd) {
      audio.pause()
      setProgress(1)
      onToggleRef.current()
    }
  }

  // 음성 파일 자체가 끝나면 재생 상태를 정지로 되돌립니다.
  const handleEnded = () => {
    setProgress(1)
    if (isPlaying) onToggleRef.current()
  }

  // 음성 파일을 불러오지 못하면 오류를 표시하고 재생 상태를 정지합니다.
  const handlePlaybackError = () => {
    setHasPlaybackError(true)
    if (isPlaying) onToggleRef.current()
  }

  // 재생 시작 시 선택한 피드백 구간의 시작 위치로 이동합니다.
  const handleToggle = () => {
    const audio = audioRef.current

    if (
      !isPlaying &&
      audio &&
      (audio.currentTime < segmentStart || audio.currentTime >= segmentEnd)
    ) {
      const seekToSegmentStart = () => {
        audio.currentTime = segmentStart
        setProgress(0)
      }

      if (audio.readyState >= HTMLMediaElement.HAVE_METADATA) {
        seekToSegmentStart()
      } else {
        audio.addEventListener('loadedmetadata', seekToSegmentStart, { once: true })
      }
    }

    setHasPlaybackError(false)
    onToggle()
  }

  return (
    <div className="py-3 relative flex w-full items-center justify-between overflow-hidden rounded-control bg-primary-alternative px-[13px]">
      <audio
        ref={audioRef}
        src={hasPlayableAudio ? audioUrl : undefined}
        preload="metadata"
        onTimeUpdate={handleTimeUpdate}
        onEnded={handleEnded}
        onError={handlePlaybackError}
      />
      <button
        type="button"
        onClick={handleToggle}
        disabled={!hasPlayableAudio}
        className="size-9 relative z-10 flex shrink-0 items-center justify-center rounded-pill bg-primary-normal disabled:cursor-not-allowed disabled:opacity-40"
        aria-label={isPlaying ? '음성 미리보기 일시정지' : '음성 미리보기 재생'}
      >
        <span className="text-label font-bold text-common-0" aria-hidden="true">
          {isPlaying ? 'Ⅱ' : '▶'}
        </span>
      </button>
      <div className="h-8 w-40 relative shrink-0">
        <img src={waveform} alt="음성 파형" />
        <span
          className="top-0 absolute h-full w-px bg-primary-normal transition-[left] duration-100"
          style={{ left: `${progress * 100}%` }}
          aria-hidden="true"
        />
      </div>
      <span className="text-label font-medium text-primary-normal">
        {!hasPlayableAudio
          ? '음성 없음'
          : hasPlaybackError
            ? '재생 실패'
            : `${Math.ceil(segmentDuration)}초`}
      </span>
    </div>
  )
}
