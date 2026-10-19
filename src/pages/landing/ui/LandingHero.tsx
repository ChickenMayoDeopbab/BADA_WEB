import { LuArrowDown, LuAudioLines, LuCheck, LuPhone } from 'react-icons/lu'
import { AppScreen } from './AppScreen'

/** 브랜드의 첫 인상과 세 가지 실제 앱 화면을 하나의 제품 장면으로 보여줍니다. */
export const LandingHero = () => (
  <section data-landing-hero aria-labelledby="hero-title" className="landing-hero">
    <div className="landing-hero-orbit" aria-hidden="true" />
    <div className="landing-hero-inner">
      <div data-hero-copy className="landing-hero-copy">
        <p className="landing-eyebrow">
          <span className="landing-live-dot" /> 전화가 편해지는 연습, BADA
        </p>
        <h1 id="hero-title">
          전화 앞에서,
          <br />
          조금 더 <span>나답게.</span>
        </h1>
        <p className="landing-hero-description">
          몇 번씩 고쳐 쓰던 첫마디도,
          <br />
          미루기만 했던 예약 전화도.
          <br />
          AI와 먼저 연습하면, 시작이 가벼워져요.
        </p>
        <div className="landing-hero-actions">
          <a
            href="#download"
            className="gap-5 px-6 py-3 inline-flex items-center justify-center rounded-pill bg-label-normal text-label font-medium text-background-normal"
          >
            앱 다운로드 <LuArrowDown className="size-5" aria-hidden="true" />
          </a>
        </div>
        <p className="landing-hero-note">App Store · ONE store에서 BADA를 만나보세요.</p>
      </div>
      <div className="landing-hero-art" data-hero-image>
        <div className="hero-device hero-device-scenario">
          <AppScreen variant="scenario" />
        </div>
        <div className="hero-device hero-device-report">
          <AppScreen variant="report" />
        </div>
        <div className="hero-device hero-device-call">
          <AppScreen variant="call" />
        </div>
        <div className="hero-float hero-float-call">
          <span>
            <LuPhone aria-hidden="true" />
          </span>
          <p>
            내 속도에 맞춘
            <br />
            <strong>AI 통화 연습</strong>
          </p>
          <LuAudioLines aria-hidden="true" />
        </div>
        <div className="hero-float hero-float-feedback">
          <span>
            <LuCheck aria-hidden="true" />
          </span>
          <p>
            오늘의 작은 시도가
            <br />
            <strong>내일의 자신감으로.</strong>
          </p>
        </div>
      </div>
    </div>
    <div className="landing-hero-bottom">
      <span>작은 용기를, 일상의 자신감으로.</span>
      <a href="#experience">
        SCROLL TO EXPLORE <LuArrowDown aria-hidden="true" />
      </a>
      <span>WEB & APP</span>
    </div>
  </section>
)
