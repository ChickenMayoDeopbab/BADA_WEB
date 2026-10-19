import { LuArrowDown } from 'react-icons/lu'
import { buildVoicePath } from '../model/brandMotion'
import { AppScreen } from './AppScreen'
import { WebStartLink } from './WebStartLink'

/** 타이포·음성 선·한 장의 앱 화면으로 구성하는 에디토리얼 브랜드 포스터입니다. */
export const LandingHero = () => (
  <section className="brand-hero" data-landing-hero aria-labelledby="hero-title">
    <div className="brand-hero-meta">
      <span>
        <i /> AI와 함께하는 통화 연습
      </span>
    </div>
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
    <figure className="brand-hero-object" data-hero-object>
      <AppScreen variant="call" />
    </figure>
    <div className="brand-hero-bottom" data-hero-footnote>
      <p>
        전화가 부담스러울 때,
        <br />
        AI와 먼저 연습해보세요.
      </p>
      <WebStartLink className="brand-hero-start">나의 첫 연습 시작하기</WebStartLink>
    </div>
    <svg
      className="brand-voice-line"
      viewBox="0 0 1440 280"
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <path data-voice-path d={buildVoicePath()} />
    </svg>
    <div className="brand-hero-index">
      <a href="#experience">
        스크롤해서 연습 흐름 보기 <LuArrowDown aria-hidden="true" />
      </a>
    </div>
  </section>
)
