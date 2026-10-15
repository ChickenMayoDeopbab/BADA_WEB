import { getRingtoneSetting, ringtoneKeys } from '@entities/ringtone'
import defaultRingtone from '@shared/assets/scenario-training/ringtone-default.mp3'
import { useQuery } from '@tanstack/react-query'
import { useEffect, useRef, useState } from 'react'

/** 서버의 벨소리 설정을 수신 중에만 재생하고 자동 재생 차단은 사용자 클릭으로 해제합니다. */
export const useIncomingRingtone = (isIncoming: boolean) => {
  const ringtoneQuery = useQuery({
    queryKey: ringtoneKeys.setting,
    queryFn: getRingtoneSetting,
    enabled: isIncoming,
  })
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const [isBlocked, setIsBlocked] = useState(false)
  const audioUrl = ringtoneQuery.data?.defaultRingtone ? defaultRingtone : ringtoneQuery.data?.url

  useEffect(() => {
    if (!isIncoming || !audioUrl) return
    const audio = new Audio(audioUrl)
    audio.loop = true
    audioRef.current = audio
    let isDisposed = false
    void audio
      .play()
      .then(() => {
        if (!isDisposed) setIsBlocked(false)
      })
      .catch(() => {
        if (!isDisposed) setIsBlocked(true)
      })
    return () => {
      isDisposed = true
      audio.pause()
      audio.removeAttribute('src')
      audio.load()
      if (audioRef.current === audio) audioRef.current = null
    }
  }, [isIncoming, audioUrl])

  /** 브라우저가 차단한 벨소리를 사용자 제스처 안에서 다시 재생합니다. */
  const handlePlay = async () => {
    const audio = audioRef.current
    if (!audio || !isIncoming) return
    try {
      await audio.play()
      if (audioRef.current === audio) setIsBlocked(false)
    } catch {
      if (audioRef.current === audio) setIsBlocked(true)
    }
  }

  return { isRingtoneBlocked: isIncoming && isBlocked, handlePlayRingtone: handlePlay }
}
