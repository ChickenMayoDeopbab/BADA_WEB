import { LuArrowRight, LuArrowUpRight, LuAudioLines, LuRotateCcw } from 'react-icons/lu'
import { previewScenarios } from '../model/landingContent'
import { useTrainingPreview } from '../model/useTrainingPreview'

/** 상황 선택과 대화 진행을 하나의 집중된 연습 미리보기로 구성합니다. */
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
    <section
      id="practice"
      aria-labelledby="practice-title"
      className="scroll-mt-20 px-6 py-16 sm:py-20 lg:px-12 bg-label-normal text-background-normal"
    >
      <div className="max-w-6xl gap-10 lg:grid-cols-2 lg:gap-20 mx-auto grid items-start">
        <div data-reveal>
          <p className="text-label text-background-normal/60">먼저, 가볍게 해볼까요?</p>
          <h2 id="practice-title" className="mt-5 sm:text-marketing-title text-display2 font-bold">
            내일의 전화를,
            <br />
            오늘 연습해보세요.
          </h2>
          <p className="mt-5 max-w-sm leading-relaxed text-body text-background-normal/60">
            어떤 전화가 마음에 걸리나요?
            <br />
            상황을 고르고 AI와의 대화 흐름을 살펴보세요.
          </p>
          <div
            role="group"
            aria-label="미리보기 상황 선택"
            className="mt-8 border-t border-background-normal/20"
          >
            {previewScenarios.map(({ id, category, title }, index) => (
              <button
                key={id}
                type="button"
                aria-pressed={scenarioIndex === index}
                onClick={() => selectScenario(index)}
                className={`group min-h-20 gap-5 py-4 flex w-full items-center border-b border-background-normal/20 text-left transition-opacity ${scenarioIndex === index ? 'text-background-normal' : 'text-background-normal/50 hover:text-background-normal'}`}
              >
                <span className="text-caption">0{index + 1}</span>
                <span className="flex-1">
                  <span className="block text-caption">{category}</span>
                  <span className="mt-1 block text-headline2 font-medium">{title}</span>
                </span>
                <span
                  className={`size-9 flex shrink-0 items-center justify-center rounded-pill ${scenarioIndex === index ? 'bg-primary-normal text-label-strong' : 'border border-background-normal/30'}`}
                >
                  <LuArrowUpRight className="size-4" aria-hidden="true" />
                </span>
              </button>
            ))}
          </div>
          <p className="mt-5 text-caption text-background-normal/50">
            화면 이해를 위한 예시이며 실제 통화는 시작되지 않아요.
          </p>
        </div>
        <figure
          data-reveal
          className="m-0 p-5 sm:p-8 rounded-dialog bg-background-normal text-label-normal"
        >
          <figcaption className="gap-3 pb-5 flex items-center justify-between border-b border-line-alternative">
            <div className="gap-3 flex items-center">
              <span className="size-10 flex items-center justify-center rounded-pill bg-primary-normal text-label-strong">
                <LuAudioLines className="size-5" aria-hidden="true" />
              </span>
              <div>
                <p className="text-caption text-label-alternative">AI {scenario.partner}</p>
                <h3 className="mt-1 text-headline2 font-bold">{scenario.title}</h3>
              </div>
            </div>
          </figcaption>
          <div className="py-6" aria-live="polite" aria-atomic="true">
            {isFeedbackVisible ? (
              <div className="py-3">
                <p className="text-caption text-label-alternative">피드백 예시</p>
                <h3 className="mt-4 text-title2 font-bold">이렇게 대화를 돌아봐요.</h3>
                <p className="mt-5 pl-4 leading-relaxed border-l-2 border-primary-normal text-body text-label-neutral">
                  {scenario.feedback}
                </p>
                <p className="mt-5 text-caption text-label-alternative">
                  실제 결과는 연습 내용에 따라 달라져요.
                </p>
              </div>
            ) : (
              <div className="space-y-5">
                {scenario.dialogue.slice(0, visibleTurns).map(({ speaker, text }, index) => (
                  <div
                    key={`${scenario.id}-${index}`}
                    className={speaker === 'ai' ? 'mr-5' : 'ml-5'}
                  >
                    <p
                      className={`mb-2 text-caption text-label-alternative ${speaker === 'user' ? 'text-right' : ''}`}
                    >
                      {speaker === 'ai' ? 'AI' : '나'}
                    </p>
                    <p
                      className={`px-4 py-3 leading-relaxed rounded-component text-label ${speaker === 'ai' ? 'bg-fill-field text-label-neutral' : 'bg-primary-alternative'}`}
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
            className="min-h-12 gap-3 pt-4 flex w-full items-center justify-between border-t border-line-neutral text-label font-medium hover:text-label-alternative"
          >
            {isFeedbackVisible ? (
              <>
                <span>다시 살펴보기</span>
                <LuRotateCcw aria-hidden="true" />
              </>
            ) : (
              <>
                <span>
                  {visibleTurns < scenario.dialogue.length ? '다음 대화 보기' : '피드백 예시 보기'}
                </span>
                <LuArrowRight aria-hidden="true" />
              </>
            )}
          </button>
        </figure>
      </div>
    </section>
  )
}
