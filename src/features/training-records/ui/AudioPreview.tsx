import { useTranslation } from '@shared/lib'
import { useAudioWaveform } from '../model/useAudioWaveform'
import { IoPause, IoPlay } from 'react-icons/io5'
import { useEffect, useRef, useState } from 'react'
import type { CSSProperties } from 'react'

interface AudioPreviewProps {
  isPlaying: boolean
  audioUrl?: string
  startSecond: number
  endSecond: number
  onToggle: () => void
}

// 초 단위 길이를 분:초 형식으로 표시합니다.
const formatSegmentDuration = (seconds: number) => {
  const safeSeconds = Math.max(0, Math.round(seconds))
  const minutes = Math.floor(safeSeconds / 60)
  const remainingSeconds = safeSeconds % 60

  return `${minutes}:${String(remainingSeconds).padStart(2, '0')}`
}

// 선택한 피드백 구간의 녹음 음성을 재생합니다.
export const AudioPreview = ({
  isPlaying,
  audioUrl,
  startSecond,
  endSecond,
  onToggle,
}: AudioPreviewProps) => {
  const { t } = useTranslation()

  const audioRef = useRef<HTMLAudioElement>(null)
  const onToggleRef = useRef(onToggle)
  const [progress, setProgress] = useState(0)
  const [hasPlaybackError, setHasPlaybackError] = useState(false)
  const segmentStart = Math.max(0, startSecond)
  const segmentEnd = Math.max(segmentStart, endSecond)
  const segmentDuration = segmentEnd - segmentStart
  const hasPlayableAudio = Boolean(audioUrl && segmentDuration > 0)
  const waveform = useAudioWaveform(audioUrl, segmentStart, segmentEnd)
  const displayedProgress = isPlaying ? Math.max(progress, 1 / waveform.length) : progress

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

  // 음원 메타데이터가 준비될 때까지 기다린 뒤 피드백 시작 위치로 이동합니다.
  const seekToSegmentStart = async (audio: HTMLAudioElement) => {
    if (audio.readyState < HTMLMediaElement.HAVE_METADATA) {
      await new Promise<void>((resolve) => {
        audio.addEventListener('loadedmetadata', () => resolve(), { once: true })
      })
    }

    audio.currentTime = segmentStart
    setProgress(0)
  }

  // 재생 시작 위치를 먼저 맞춘 뒤 재생 상태를 전환합니다.
  const handleToggle = async () => {
    const audio = audioRef.current

    if (
      !isPlaying &&
      audio &&
      (audio.currentTime < segmentStart || audio.currentTime >= segmentEnd)
    ) {
      await seekToSegmentStart(audio)
    }

    setHasPlaybackError(false)
    onToggle()
  }

  return (
    <div className="gap-3 px-3 flex h-[72px] w-full items-center overflow-hidden rounded-component bg-green-90">
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
        onClick={() => void handleToggle()}
        disabled={!hasPlayableAudio}
        className="size-12 flex shrink-0 items-center justify-center rounded-pill bg-green-40 text-common-0 transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:bg-line-normal"
        aria-label={isPlaying ? '음성 미리보기 일시정지' : '음성 미리보기 재생'}
      >
        {isPlaying ? (
          <IoPause className="size-6" aria-hidden="true" />
        ) : (
          <IoPlay className="size-6 translate-x-px" aria-hidden="true" />
        )}
      </button>
      <div
        className="h-12 min-w-0 gap-0.5 flex flex-1 items-center justify-center overflow-hidden"
        role="img"
        aria-label={t('음성 파형')}
      >
        {waveform.map((heightRatio, index) => {
          const barProgress = Math.min(1, Math.max(0, displayedProgress * waveform.length - index))

          return (
            <span
              key={index}
              className="relative h-[var(--waveform-height)] w-[3px] shrink-0 overflow-hidden rounded-pill bg-line-normal"
              style={
                {
                  '--waveform-height': `${Math.round(heightRatio * 44)}px`,
                } as CSSProperties
              }
            >
              <span
                className="inset-y-0 left-0 absolute bg-green-40"
                style={{ width: `${barProgress * 100}%` }}
              />
            </span>
          )
        })}
      </div>
      <span className="shrink-0 text-body font-medium text-label-alternative tabular-nums">
        {!hasPlayableAudio
          ? '음성 없음'
          : hasPlaybackError
            ? '재생 실패'
            : formatSegmentDuration(segmentDuration)}
      </span>
    </div>
  )
}
