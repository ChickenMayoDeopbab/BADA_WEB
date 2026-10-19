import { Link } from 'react-router-dom'
import { LuArrowUpRight, LuPlus } from 'react-icons/lu'
import { routePaths } from '@shared/config'
import logo from '@shared/assets/auth/logo.svg'
import { LandingHero } from './LandingHero'
import { LandingStory } from './LandingStory'
import { landingQuestions } from '../model/landingContent'
import { useLandingScroll } from '../model/useLandingScroll'
import { AppDownload } from './AppDownload'
import { FeatureTour } from './FeatureTour'
import { LandingFooter } from './LandingFooter'
import { TrainingPreview } from './TrainingPreview'
import { WebStartLink } from './WebStartLink'
import './landingMotion.css'
import './landingBrand.css'

/** 생활 속 통화 장면과 직접 해보는 연습을 중심으로 브랜드 랜딩을 구성합니다. */
export const LandingPage = () => {
  const { pageRef } = useLandingScroll()
  return (
    <div
      ref={pageRef}
      className="landing-page ux-page bg-background-normal text-label-normal [&_h1]:break-keep [&_h2]:break-keep [&_h3]:break-keep"
    >
      <a
        href="#main-content"
        className="focus:left-4 focus:top-4 focus:p-4 sr-only focus:not-sr-only focus:fixed focus:z-50 focus:rounded-control focus:bg-background-normal"
      >
        본문으로 건너뛰기
      </a>
      <header data-landing-header className="inset-x-0 top-0 fixed z-30">
        <div className="min-h-20 max-w-7xl gap-4 px-6 lg:px-12 mx-auto flex items-center justify-between">
          <Link to={routePaths.landing} aria-label="BADA 홈">
            <img src={logo} alt="BADA" className="h-6 sm:h-8 w-auto" />
          </Link>
          <nav aria-label="랜딩 메뉴" className="gap-5 sm:gap-8 flex items-center text-label">
            <WebStartLink />
          </nav>
        </div>
        <div className="landing-scroll-progress" aria-hidden="true" />
      </header>

      <main id="main-content">
        <LandingHero />
        <LandingStory />
        <FeatureTour />
        <TrainingPreview />

        <section
          data-reveal
          id="warmup"
          aria-labelledby="warmup-title"
          className="landing-warmup scroll-mt-24 px-6 py-20 lg:px-12 lg:py-28 bg-primary-alternative"
        >
          <div className="max-w-6xl gap-8 sm:grid-cols-[auto_1fr] sm:gap-x-12 lg:grid-cols-[auto_1fr_auto] mx-auto grid items-center">
            <p className="gap-1 flex items-baseline text-marketing-hero font-bold">
              <span>30</span>
              <span className="text-title2 font-medium">초</span>
            </p>
            <div>
              <h2 id="warmup-title" className="sm:text-title1 text-title2 font-bold">
                오늘은, 첫마디만 꺼내봐도 충분해요.
              </h2>
              <p className="mt-3 max-w-lg leading-relaxed text-body text-label-alternative">
                긴 통화가 부담스럽다면 짧은 워밍업부터.
                <br className="sm:block hidden" />
                상대와 목적을 정하고 가볍게 시작해 보세요.
              </p>
            </div>
            <div className="sm:col-start-2 lg:col-auto">
              <WebStartLink destination={routePaths.trainingWarmup}>워밍업 시작하기</WebStartLink>
            </div>
          </div>
        </section>

        <section
          data-reveal
          id="faq"
          aria-labelledby="faq-title"
          className="max-w-7xl scroll-mt-24 gap-9 px-6 py-20 sm:py-32 lg:grid-cols-3 lg:gap-16 lg:px-12 mx-auto grid"
        >
          <div>
            <p className="text-caption font-medium text-label-alternative">자주 묻는 질문</p>
            <h2 id="faq-title" className="mt-4 sm:text-display2 text-title1 font-bold">
              시작하기 전에.
            </h2>
            <a
              href="mailto:team.bada.service@gmail.com"
              className="mt-5 min-h-11 gap-3 inline-flex items-center text-label text-label-alternative"
            >
              다른 궁금한 점이 있나요?
              <LuArrowUpRight className="size-4" aria-hidden="true" />
            </a>
          </div>
          <div className="lg:col-span-2">
            {landingQuestions.map(({ question, answer }) => (
              <details key={question} className="group border-b border-line-neutral first:border-t">
                <summary className="gap-5 py-5 flex cursor-pointer list-none items-center justify-between text-body font-medium [&::-webkit-details-marker]:hidden">
                  {question}
                  <LuPlus
                    className="size-4 shrink-0 transition-transform group-open:rotate-45 motion-reduce:transition-none"
                    aria-hidden="true"
                  />
                </summary>
                <p className="pb-5 pr-7 leading-relaxed text-label text-label-alternative">
                  {answer}
                </p>
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
