import { buildVoicePath } from '../model/brandMotion'
import { HeroConversation } from './HeroConversation'
import { WebStartLink } from './WebStartLink'

/** 큰 타이포와 첫 인사 미리보기, 음성 선을 연결하는 브랜드 히어로입니다. */
export const LandingHero = () => (
  <section className="brand-hero" data-landing-hero aria-labelledby="hero-title">
    <h1 id="hero-title" className="brand-hero-title">
      <span className="brand-line-mask">
        <span data-hero-line>망설임에서,</span>
      </span>
      <span className="brand-line-mask">
        <span data-hero-line>
          첫마디로<span className="brand-period">.</span>
        </span>
      </span>
    </h1>
    <HeroConversation />
    <div className="brand-hero-action" data-hero-action>
      <WebStartLink className="brand-hero-start">연습 시작하기</WebStartLink>
    </div>
    <svg
      className="brand-voice-line"
      viewBox="0 0 1440 280"
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <path data-voice-path d={buildVoicePath()} />
    </svg>
  </section>
)
