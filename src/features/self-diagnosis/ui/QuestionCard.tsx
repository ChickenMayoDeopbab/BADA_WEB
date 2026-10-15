import { useTranslation } from '@shared/lib'
import { StatusState, LoadingRegion, Skeleton, BackIcon } from '@shared/ui'
import type { SelfDiagnosis } from '../model/useSelfDiagnosis'
import { AnswerScale } from './AnswerScale'
import { DiagnosisButton } from './DiagnosisButton'
import { DiagnosisCard } from './DiagnosisCard'

type QuestionCardProps = {
  diagnosis: SelfDiagnosis
}

// 진행률, 현재 문항, 5점 척도 응답과 다음 문항 버튼을 보여줍니다.
export const QuestionCard = ({ diagnosis }: QuestionCardProps) => {
  const { t } = useTranslation()

  const {
    questionsStatus,
    currentQuestion,
    currentIndex,
    totalCount,
    currentAnswer,
    selectAnswer,
    goNext,
    goBack,
    retryQuestions,
  } = diagnosis
  const progress = totalCount > 0 ? ((currentIndex + 1) / totalCount) * 100 : 0
  const isLastQuestion = currentIndex === totalCount - 1

  return (
    <DiagnosisCard className="gap-8">
      <header className="flex w-full items-center justify-between">
        <button
          type="button"
          aria-label={t('이전으로')}
          onClick={goBack}
          className="size-10 flex items-center justify-center rounded-component text-label-normal hover:bg-fill-normal"
        >
          <BackIcon />
        </button>
        <h1 className="text-headline2 font-bold text-label-normal">{t('자가진단')}</h1>
        <span className="size-10" aria-hidden />
      </header>

      {questionsStatus === 'success' && currentQuestion ? (
        <>
          <div className="gap-2.5 flex w-full flex-col">
            <div className="flex items-center justify-between">
              <span className="text-label font-medium text-label-alternative">
                {t('콜포비아 자가진단')}
              </span>
              <span className="text-label font-bold text-label-normal">
                {currentIndex + 1}/{totalCount}
              </span>
            </div>
            <div
              role="progressbar"
              aria-label={t('자가진단 진행률')}
              aria-valuemin={1}
              aria-valuemax={totalCount}
              aria-valuenow={currentIndex + 1}
              className="h-3 w-full overflow-hidden rounded-pill bg-fill-neutral"
            >
              <div
                className="h-full rounded-pill bg-primary-normal transition-[width]"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="text-caption font-medium text-label-alternative">
              {t('콜포비아는 모두가 겪을 수 있는 자연스러운 현상이에요.')}
            </p>
          </div>

          <h2
            key={currentQuestion.questionId}
            aria-live="polite"
            className="ux-page py-12 max-w-[420px] text-center text-title1 font-bold break-keep text-label-normal"
          >
            {currentQuestion.content}
          </h2>

          <AnswerScale
            name={`diagnosis-question-${currentQuestion.questionId}`}
            value={currentAnswer}
            onChange={selectAnswer}
          />
          <hr className="w-full border-t-2 border-line-alternative" />
          <DiagnosisButton
            label={isLastQuestion ? '결과 확인하기' : '다음 문항'}
            disabled={currentAnswer == null}
            onClick={goNext}
          />
        </>
      ) : (
        <div className="gap-4 py-12 flex w-full flex-col items-center text-center">
          {questionsStatus === 'error' ? (
            <>
              <p className="text-body font-medium text-label-alternative">
                {t('문항을 불러오지 못했어요.')}
              </p>
              <DiagnosisButton
                label={t('다시 불러오기')}
                variant="secondary"
                onClick={retryQuestions}
              />
            </>
          ) : questionsStatus === 'success' ? (
            <StatusState
              title={t('현재 진행할 자가진단 문항이 없어요.')}
              action={
                <DiagnosisButton label={t('이전으로')} variant="secondary" onClick={goBack} />
              }
            />
          ) : (
            <LoadingRegion label={t('문항을 불러오는 중')} className="w-full">
              <Skeleton className="h-3" />
              <Skeleton className="mt-10 h-16" />
              <div className="mt-10 gap-3 flex">
                {Array.from({ length: 5 }, (_, i) => (
                  <Skeleton key={i} className="h-14 flex-1" />
                ))}
              </div>
            </LoadingRegion>
          )}
        </div>
      )}
    </DiagnosisCard>
  )
}
