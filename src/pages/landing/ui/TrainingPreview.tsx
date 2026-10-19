import { LuArrowRight, LuArrowUpRight, LuRotateCcw } from 'react-icons/lu'
import { previewScenarios } from '../model/landingContent'
import { useTrainingPreview } from '../model/useTrainingPreview'

/** 카드를 쌓는 대신 하나의 통화 스튜디오에서 상황과 대화를 직접 탐색합니다. */
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
    <section id="practice" className="brand-practice" aria-labelledby="practice-title">
      <div className="brand-practice-heading">
        <p className="brand-kicker">03 / 먼저, 한 번 해볼까요?</p>
        <h2 id="practice-title">
          어떤 전화가
          <br />
          마음에 걸리나요?
        </h2>
        <span className="brand-practice-label">
          <i /> INTERACTIVE PREVIEW
        </span>
      </div>
      <div className="brand-practice-studio">
        <div role="group" aria-label="미리보기 상황 선택" className="brand-scenario-list">
          {previewScenarios.map(({ id, category, title }, index) => (
            <button
              key={id}
              type="button"
              aria-pressed={scenarioIndex === index}
              onClick={() => selectScenario(index)}
            >
              <span>
                0{index + 1} / {category}
              </span>
              <strong>{title}</strong>
              <LuArrowUpRight aria-hidden="true" />
            </button>
          ))}
          <p className="brand-preview-disclaimer">
            화면 이해를 위한 대화 예시예요.
            <br />
            실제 통화와 마이크 사용은 시작되지 않아요.
          </p>
        </div>
        <figure className="brand-conversation">
          <figcaption>
            <span>AI / {scenario.partner}</span>
            <h3>{scenario.title}</h3>
          </figcaption>
          <div className="brand-conversation-body" aria-live="polite" aria-atomic="true">
            {isFeedbackVisible ? (
              <div className="brand-feedback">
                <span>AFTER THE CALL</span>
                <h3>이렇게 대화를 돌아봐요.</h3>
                <p>{scenario.feedback}</p>
                <small>실제 결과는 연습 내용에 따라 달라져요.</small>
              </div>
            ) : (
              <div className="brand-dialogue">
                {scenario.dialogue.slice(0, visibleTurns).map(({ speaker, text }, index) => (
                  <div
                    key={`${scenario.id}-${index}`}
                    className={speaker === 'user' ? 'brand-dialogue-user' : ''}
                  >
                    <span>{speaker === 'ai' ? 'AI' : '나'}</span>
                    <p>{text}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
          <button type="button" className="brand-next-turn" onClick={advancePreview}>
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
