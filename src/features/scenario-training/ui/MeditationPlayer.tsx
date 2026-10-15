import { useMeditationPlayer } from '../model/useMeditationPlayer'

/** 화면 전체에서 명상 영상을 재생하고 오른쪽 아래에 통화 시작 버튼을 표시합니다. */
export const MeditationPlayer = ({ onFinish }: { onFinish: () => void }) => {
  const { videoUrl } = useMeditationPlayer()
  return (
    <main
      className="inset-0 fixed z-50 h-dvh overflow-hidden bg-common-100"
      aria-label={'훈련 전 명상'}
    >
      <iframe
        className="size-full border-0"
        src={videoUrl}
        title={'통화 전 명상 영상'}
        allow="autoplay; encrypted-media"
        referrerPolicy="strict-origin-when-cross-origin"
      />
      <button
        type="button"
        className="bottom-6 right-6 px-4 py-2 absolute rounded-control bg-primary-normal text-label font-bold text-label-button-text shadow-subtle-card"
        onClick={onFinish}
      >
        {'명상 끝내고 전화하기'}
      </button>
    </main>
  )
}
