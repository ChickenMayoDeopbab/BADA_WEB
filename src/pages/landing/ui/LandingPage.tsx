import { Link } from 'react-router-dom'
import { LuArrowUpRight, LuPlus } from 'react-icons/lu'
import { routePaths } from '@shared/config'
import { LandingDiagnosis } from '@features/self-diagnosis'
import logo from '@shared/assets/auth/logo.svg'
import { landingQuestions } from '../model/landingContent'
import { useLandingScroll } from '../model/useLandingScroll'
import { useBrandMotion } from '../model/useBrandMotion'
import { LandingHero } from './LandingHero'
import { FeatureTour } from './FeatureTour'
import { PracticePreview } from './PracticePreview'
import { AppDownload } from './AppDownload'
import { LandingFooter } from './LandingFooter'
import { WebStartLink } from './WebStartLink'
import './landingBrand.css'

/** 통화 흐름·설정 미리보기·자가진단·다운로드를 연결하는 랜딩을 구성합니다. */
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
        <nav aria-label="랜딩 메뉴">
          <a href="#download">
            앱 다운로드 <LuArrowUpRight aria-hidden="true" />
          </a>
          <WebStartLink />
        </nav>
      </header>
      <main id="main-content">
        <LandingHero />
        <FeatureTour />
        <PracticePreview />
        <LandingDiagnosis />
        <section id="faq" className="brand-faq" aria-labelledby="faq-title">
          <div>
            <h2 id="faq-title">궁금한 점</h2>
          </div>
          <div>
            {landingQuestions.map(({ question, answer }) => (
              <details key={question}>
                <summary>
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
