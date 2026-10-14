import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { useState } from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { AudioPreview } from './AudioPreview'

// 실제 사용 흐름과 동일하게 재생 상태를 소유하는 테스트 컨테이너를 표시합니다.
const AudioPreviewHarness = ({ audioUrl }: { audioUrl?: string }) => {
  const [isPlaying, setIsPlaying] = useState(false)

  return (
    <AudioPreview
      isPlaying={isPlaying}
      audioUrl={audioUrl}
      startSecond={10}
      endSecond={13}
      onToggle={() => setIsPlaying((current) => !current)}
    />
  )
}

describe('AudioPreview', () => {
  const playMock = vi.spyOn(HTMLMediaElement.prototype, 'play')
  const pauseMock = vi.spyOn(HTMLMediaElement.prototype, 'pause')

  beforeEach(() => {
    playMock.mockResolvedValue(undefined)
    pauseMock.mockImplementation(() => undefined)
  })

  afterEach(() => {
    cleanup()
    vi.clearAllMocks()
  })

  it('선택한 피드백 구간부터 재생하고 구간 끝에서 멈춘다', async () => {
    const { container } = render(
      <AudioPreviewHarness audioUrl="https://cdn.example.com/call.mp3" />,
    )
    const audio = container.querySelector('audio') as HTMLAudioElement

    fireEvent.click(screen.getByRole('button', { name: '음성 미리보기 재생' }))
    fireEvent.loadedMetadata(audio)

    await waitFor(() => expect(playMock).toHaveBeenCalledOnce())
    expect(audio.currentTime).toBe(10)
    expect(screen.getByRole('button', { name: '음성 미리보기 일시정지' })).toBeEnabled()

    audio.currentTime = 13
    fireEvent.timeUpdate(audio)

    await waitFor(() =>
      expect(screen.getByRole('button', { name: '음성 미리보기 재생' })).toBeEnabled(),
    )
    expect(pauseMock).toHaveBeenCalled()
    expect(screen.getByText('0:03')).toBeInTheDocument()
    expect(screen.getByRole('img', { name: '음성 파형' }).children).toHaveLength(25)
  })

  it('녹음 주소가 없으면 재생 버튼을 비활성화한다', () => {
    render(<AudioPreviewHarness />)

    expect(screen.getByRole('button', { name: '음성 미리보기 재생' })).toBeDisabled()
    expect(screen.getByText('음성 없음')).toBeInTheDocument()
  })
})
