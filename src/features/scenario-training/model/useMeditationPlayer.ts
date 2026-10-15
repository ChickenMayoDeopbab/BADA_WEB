import { useEffect } from 'react'
import { lockPageScroll } from '@shared/lib'

// 앱 명상 영상의 출처로 표기된 촛불 영상입니다.
const meditationVideoId = 'z6b5nLI6BqI'

/** 재생 조작 UI 없이 원본 유튜브 영상을 표시하고 명상 화면의 스크롤을 잠급니다. */
export const useMeditationPlayer = () => {
  useEffect(() => lockPageScroll(), [])
  const parameters = new URLSearchParams({
    autoplay: '1',
    controls: '0',
    playsinline: '1',
    fs: '0',
    rel: '0',
  })
  return { videoUrl: `https://www.youtube-nocookie.com/embed/${meditationVideoId}?${parameters}` }
}
