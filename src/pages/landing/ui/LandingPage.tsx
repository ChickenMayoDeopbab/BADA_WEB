import { Link } from 'react-router-dom'
import { LuArrowUpRight, LuPlus } from 'react-icons/lu'
import { routePaths } from '@shared/config'
import logo from '@shared/assets/auth/logo.svg'
import { landingQuestions } from '../model/landingContent'
import { useLandingScroll } from '../model/useLandingScroll'
import { useBrandMotion } from '../model/useBrandMotion'
import { LandingHero } from './LandingHero'
import { LandingStory } from './LandingStory'
import { FeatureTour } from './FeatureTour'
import { TrainingPreview } from './TrainingPreview'
import { PracticePaths } from './PracticePaths'
import { AppDownload } from './AppDownload'
import { LandingFooter } from './LandingFooter'
import { WebStartLink } from './WebStartLink'
import './landingBrand.css'

/** 망설임에서 첫마디로 이어지는 다섯 장면의 브랜드 경험을 구성합니다. */
export const LandingPage = () => {
  const { pageRef } = useLandingScroll()
  useBrandMotion(pageRef)
  return (
    <div ref={pageRef} className="landing-page brand-page bg-background-normal text-label-normal">
      <a href="#main-content" className="brand-skip-link">
        본문으로 건너뛰기
      </a>
      <header className="brand-header" data-landing-header>
        <Link to={routePaths.landing} aria-label="BADA 홈">
          <img src={logo} alt="BADA" />
        </Link>
        <span className="brand-header-caption">
          A LITTLE PRACTICE,
          <br />A LITTLE MORE YOU.
        </span>
        <nav aria-label="랜딩 메뉴">
          <a href="#experience">연습 둘러보기</a>
          <a href="#download">
            앱 다운로드 <LuArrowUpRight aria-hidden="true" />
          </a>
          <WebStartLink />
        </nav>
        <div className="landing-scroll-progress" aria-hidden="true" />
      </header>
      <main id="main-content">
        <LandingHero />
        <LandingStory />
        <FeatureTour />
        <TrainingPreview />
        <PracticePaths />
        <section id="faq" className="brand-faq" aria-labelledby="faq-title">
          <div>
            <p className="brand-kicker">BEFORE YOUR FIRST HELLO</p>
            <h2 id="faq-title">시작하기 전에.</h2>
            <a href="mailto:team.bada.service@gmail.com">
              다른 궁금한 점이 있나요? <LuArrowUpRight aria-hidden="true" />
            </a>
          </div>
          <div>
            {landingQuestions.map(({ question, answer }, index) => (
              <details key={question}>
                <summary>
                  <span>0{index + 1}</span>
                  {question}
                  <LuPlus aria-hidden="true" />
                </summary>
                <p>{answer}</p>
              </details>
            ))}
          </div>
        </section>
        <AppDownload />
      </main>
      <LandingFooter />
    </div>
  )
}
