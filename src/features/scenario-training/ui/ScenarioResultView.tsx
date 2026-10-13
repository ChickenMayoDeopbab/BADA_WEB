import { trainingResultMessages, useTrainingResult } from '../model/useTrainingResult'
import faceSmile from '@shared/assets/scenario-training/face-smile-1.svg'
import faceThinking from '@shared/assets/scenario-training/face-thinking-1.svg'
import faceWink from '@shared/assets/scenario-training/face-wink.svg'
import scoreTooltip from '@shared/assets/scenario-training/score-tooltip.svg'
import { IoChevronForward } from 'react-icons/io5'

const faceImages: Record<(typeof trainingResultMessages)[number]['face'], string> = {
  thinking: faceThinking,
  grinning: faceSmile,
  winking: faceWink,
}

const scoreColors = [
  'bg-train-anxiety-1',
  'bg-train-anxiety-2',
  'bg-train-anxiety-3',
  'bg-train-anxiety-4',
  'bg-train-anxiety-5',
  'bg-train-anxiety-6',
  'bg-train-anxiety-7',
  'bg-train-anxiety-8',
  'bg-train-anxiety-9',
  'bg-train-anxiety-10',
] as const

/** 앱과 같은 종료 안내 타이핑·헤더 이동·불안 점수 입력 흐름을 표시합니다. */
export const ScenarioResultView = () => {
  const result = useTrainingResult()

  return (
    <main className="relative min-h-screen overflow-hidden bg-background-normal">
      <section
        className={`absolute left-1/2 flex w-[760px] -translate-x-1/2 flex-col items-center text-center transition-[top,transform] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none ${
          result.isScoreVisible ? 'top-[72px]' : 'top-1/2 -translate-y-1/2'
        }`}
      >
        <div
          key={result.message.face}
          className="size-24 animate-[training-result-face-enter_400ms_ease-out] motion-reduce:animate-none"
        >
          <img src={faceImages[result.message.face]} alt="" className="size-full" />
        </div>
        <h1 className="mt-5 min-h-[94px] text-display1 font-bold whitespace-pre-line text-label-normal">
          {result.typedText}
        </h1>
      </section>

      {result.isScoreVisible ? (
        <section className="bottom-8 absolute left-1/2 w-[min(760px,calc(100vw-64px))] -translate-x-1/2 animate-[training-result-score-enter_300ms_ease-out_350ms_both] text-center motion-reduce:animate-none">
          <div>
            <div className="gap-1 flex items-end">
              {scoreColors.map((color, index) => {
                const score = index + 1
                const isSelected = result.score === score
                const isFilled = score <= result.score

                return (
                  <button
                    key={score}
                    type="button"
                    onClick={() => result.setScore(score)}
                    aria-label={`불안 점수 ${score}`}
                    className="min-w-0 relative h-[129px] flex-1"
                  >
                    {isSelected && (
                      <span className="top-0 w-16 absolute left-1/2 h-[75px] -translate-x-1/2">
                        <img src={scoreTooltip} alt="" className="size-full" />
                        <span className="inset-x-0 top-3 absolute text-title2 font-bold text-label-normal">
                          {score}
                        </span>
                      </span>
                    )}
                    <span
                      className={`inset-x-0 bottom-0 h-12 absolute rounded-[4px] ${
                        isFilled ? color : 'bg-fill-alternative'
                      }`}
                    />
                  </button>
                )
              })}
            </div>
            <div className="mt-3 flex justify-between text-caption text-label-alternative">
              <span>1 (편안함)</span>
              <span>10 (매우 불안)</span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => void result.handleSubmit()}
            disabled={result.isSubmitting}
            className="h-14 mt-[82px] w-full rounded-component bg-primary-normal text-headline2 font-bold text-common-0 disabled:bg-fill-alternative disabled:text-label-alternative"
          >
            {result.isSubmitting ? '기록 중...' : '훈련 마치기'}
          </button>
          {result.errorMessage && (
            <p role="alert" className="mt-3 text-body text-status-error">
              {result.errorMessage}
            </p>
          )}
        </section>
      ) : (
        result.messageIndex > 0 && (
          <button
            type="button"
            onClick={result.handleShowScore}
            className="bottom-12 gap-1 absolute left-1/2 flex -translate-x-1/2 items-center text-caption text-label-alternative transition-opacity hover:opacity-70"
          >
            건너뛰기
            <IoChevronForward size={13} aria-hidden="true" />
          </button>
        )
      )}
    </main>
  )
}
