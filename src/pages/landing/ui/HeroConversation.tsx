import { LuArrowUpRight, LuPhone, LuRefreshCw } from 'react-icons/lu'
import { useHeroConversation } from '../model/useHeroConversation'

/** 통화의 첫 인사를 말풍선과 음성 파형으로 표현하는 작은 인터랙티브 포스터입니다. */
export const HeroConversation = () => {
  const { greeting, reply, hasAnswered, advanceConversation } = useHeroConversation()

  return (
    <figure className="brand-hero-object" data-hero-object aria-label="첫 인사 주고받기">
      <div className="brand-conversation" data-answered={hasAnswered}>
        <div className="brand-call-orbit" aria-hidden="true">
          <span />
          <span />
          <span />
        </div>
        <div className="brand-greeting-motion" data-hero-card="greeting">
          <div className="brand-greeting">
            <span className="brand-speaker">AI</span>
            <p>{greeting}</p>
            <div className="brand-call-wave" aria-hidden="true">
              {Array.from({ length: 17 }, (_, index) => (
                <i key={index} />
              ))}
            </div>
          </div>
        </div>
        <div className="brand-answer-motion" data-hero-card="answer">
          <div className="brand-answer" id="hero-answer" aria-live="polite" aria-atomic="true">
            <span className="brand-speaker">나의 첫마디</span>
            <p>
              {hasAnswered ? (
                reply
              ) : (
                <span className="brand-waiting-dots" aria-label="아직 시작하지 않은 대화">
                  <i />
                  <i />
                  <i />
                </span>
              )}
            </p>
          </div>
        </div>
        <button
          type="button"
          className="brand-conversation-trigger"
          aria-controls="hero-answer"
          onClick={advanceConversation}
        >
          <span className="brand-conversation-phone" aria-hidden="true">
            {hasAnswered ? <LuRefreshCw /> : <LuPhone />}
          </span>
          <span>{hasAnswered ? '다른 말 건네보기' : '첫마디 건네보기'}</span>
          <LuArrowUpRight aria-hidden="true" />
        </button>
      </div>
    </figure>
  )
}
