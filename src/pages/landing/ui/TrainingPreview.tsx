import {
  LuArrowRight,
  LuAudioLines,
  LuCheck,
  LuPhone,
  LuRotateCcw,
  LuSparkles,
} from 'react-icons/lu'
import avatar from '@shared/assets/scenario-training/call-avatar.png'
import { previewScenarios } from '../model/landingContent'
import { useTrainingPreview } from '../model/useTrainingPreview'

/** 상황 선택부터 피드백까지 직접 넘겨보는 통화 예시를 표시합니다. */
export const TrainingPreview = () => {
  const {
    scenario,
    scenarioIndex,
    visibleTurns,
    isFeedbackVisible,
    selectScenario,
    advancePreview,
  } = useTrainingPreview()
  return (
    <div className="max-w-md relative mx-auto w-full">
      <div
        className="mb-4 gap-2 flex flex-wrap justify-center"
        role="group"
        aria-label="미리보기 상황 선택"
      >
        {previewScenarios.map(({ id, category }, index) => (
          <button
            key={id}
            type="button"
            aria-pressed={scenarioIndex === index}
            onClick={() => selectScenario(index)}
            className={`min-h-11 px-5 py-2 rounded-pill text-label font-medium transition-colors ${scenarioIndex === index ? 'bg-label-normal text-background-normal' : 'bg-background-normal text-label-alternative hover:bg-fill-field'}`}
          >
            {category}
          </button>
        ))}
      </div>
      <figure className="m-0 overflow-hidden rounded-dialog border border-line-alternative bg-background-normal shadow-elevated-card">
        <figcaption className="gap-3 px-5 py-4 flex items-center justify-between border-b border-line-alternative text-caption text-label-alternative">
          <span className="gap-2 flex items-center">
            <span className="size-2 rounded-pill bg-primary-normal" />
            BADA CALL
          </span>
          <span>인터랙티브 미리보기</span>
        </figcaption>
        <div className="px-5 pb-5 pt-6 sm:px-7 sm:pb-7">
          <div className="gap-4 flex items-center">
            <div className="size-14 flex shrink-0 items-center justify-center overflow-hidden rounded-pill bg-primary-alternative">
              <img src={avatar} alt="" className="size-12 object-contain" />
            </div>
            <div>
              <p className="text-caption text-label-alternative">AI {scenario.partner}</p>
              <h2 className="mt-1 text-headline2 font-bold">{scenario.title}</h2>
            </div>
            <LuAudioLines
              className="size-6 ml-auto shrink-0 text-label-neutral"
              aria-hidden="true"
            />
          </div>
          <div className="my-5 gap-2 flex items-center text-caption text-label-alternative">
            <LuPhone className="size-3" aria-hidden="true" />
            실제 통화가 아닌 화면 체험이에요.
          </div>
          <div className="min-h-60" aria-live="polite" aria-atomic="true">
            {isFeedbackVisible ? (
              <div className="p-5 rounded-card bg-primary-alternative">
                <LuSparkles className="mb-4 size-6" aria-hidden="true" />
                <p className="text-caption text-label-alternative">피드백 예시</p>
                <h3 className="mt-2 text-headline2 font-bold">이렇게 대화를 돌아봐요.</h3>
                <p className="mt-4 leading-relaxed text-label text-label-neutral">
                  {scenario.feedback}
                </p>
                <p className="mt-4 gap-2 flex items-center text-caption text-label-alternative">
                  <LuCheck aria-hidden="true" />
                  실제 결과는 연습 내용에 따라 달라져요.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {scenario.dialogue.slice(0, visibleTurns).map(({ speaker, text }, index) => (
                  <div
                    key={`${scenario.id}-${index}`}
                    className={speaker === 'ai' ? 'mr-6' : 'ml-6'}
                  >
                    <p
                      className={`mb-1 text-caption text-label-alternative ${speaker === 'user' ? 'text-right' : ''}`}
                    >
                      {speaker === 'ai' ? 'AI' : '나'}
                    </p>
                    <p
                      className={`px-4 py-3 leading-relaxed rounded-component text-label ${speaker === 'ai' ? 'bg-fill-field text-label-neutral' : 'bg-primary-alternative text-label-normal'}`}
                    >
                      {text}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
          <button
            type="button"
            onClick={advancePreview}
            className="mt-5 min-h-12 gap-2 px-4 py-3 flex w-full items-center justify-center rounded-control bg-label-normal text-label font-medium text-background-normal hover:opacity-80"
          >
            {isFeedbackVisible ? (
              <>
                <LuRotateCcw aria-hidden="true" />
                다시 살펴보기
              </>
            ) : (
              <>
                {visibleTurns < scenario.dialogue.length ? '다음 대화 보기' : '피드백 예시 보기'}
                <LuArrowRight aria-hidden="true" />
              </>
            )}
          </button>
        </div>
      </figure>
      <p className="mt-4 text-center text-caption text-label-alternative">
        상황을 고르고 대화를 넘겨보세요.
      </p>
    </div>
  )
}
