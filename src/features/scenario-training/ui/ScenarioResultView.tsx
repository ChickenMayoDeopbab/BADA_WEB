import { useTranslation } from '@shared/lib'
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
  const { t } = useTranslation()

  const result = useTrainingResult()

  if (!result.canRecordScore) {
    return (
      <main className="gap-5 p-8 flex min-h-screen flex-col items-center justify-center bg-background-normal text-center">
        <h1 className="text-title1 font-bold text-label-normal">{t('훈련이 종료됐어요.')}</h1>
        <p className="text-body text-label-alternative">
          {t('이번 통화는 불안 점수를 기록할 수 없어요. 훈련 기록에서 통화 내용을 확인해 주세요.')}
        </p>
        <button
          type="button"
          onClick={() => void result.handleSubmit()}
          className="px-6 py-3 rounded-component bg-primary-normal text-body font-bold text-label-button-text"
        >
          {t('기록 확인하기')}
        </button>
      </main>
    )
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-background-normal">
      <section
        className={`absolute left-1/2 flex w-[760px] max-w-[calc(100%-32px)] -translate-x-1/2 flex-col items-center text-center transition-[top,transform] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none ${
          result.isScoreVisible ? 'top-[72px]' : 'top-1/2 -translate-y-1/2'
        }`}
      >
        <div
          key={result.message.face}
          className="size-24 animate-[training-result-face-enter_400ms_ease-out] motion-reduce:animate-none"
        >
          <img src={faceImages[result.message.face]} alt="" className="size-full" />
        </div>
        <h1 className="mt-5 max-sm:text-title1 min-h-[94px] text-display1 font-bold whitespace-pre-line text-label-normal">
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
                    aria-pressed={isSelected}
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
              <span>{t('1 (편안함)')}</span>
              <span>{t('10 (매우 불안)')}</span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => void result.handleSubmit()}
            disabled={result.isSubmitting}
            aria-busy={result.isSubmitting}
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
            {t('건너뛰기')}
            <IoChevronForward size={13} aria-hidden="true" />
          </button>
        )
      )}
    </main>
  )
}
