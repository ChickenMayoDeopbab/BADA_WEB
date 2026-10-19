import { Link } from 'react-router-dom'
import { LuArrowDown, LuArrowUpRight, LuPhone, LuPlus } from 'react-icons/lu'
import { routePaths } from '@shared/config'
import logo from '@shared/assets/auth/logo.svg'
import heroImage from '@shared/assets/landing/everyday-call.jpg'
import { landingQuestions } from '../model/landingContent'
import { useLandingScroll } from '../model/useLandingScroll'
import { AppDownload } from './AppDownload'
import { FeatureTour } from './FeatureTour'
import { LandingFooter } from './LandingFooter'
import { TrainingPreview } from './TrainingPreview'
import { WebStartLink } from './WebStartLink'
import './landingMotion.css'

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
      <header
        data-landing-header
        className="top-0 backdrop-blur-sm sticky z-30 border-b border-line-alternative bg-background-normal/95"
      >
        <div className="min-h-20 max-w-7xl gap-4 px-6 lg:px-12 mx-auto flex items-center justify-between">
          <Link to={routePaths.landing} aria-label="BADA 홈">
            <img src={logo} alt="BADA" className="h-6 sm:h-8 w-auto" />
          </Link>
          <nav aria-label="랜딩 메뉴" className="gap-5 sm:gap-8 flex items-center text-label">
            <a
              href="#download"
              className="gap-3 px-5 py-3 inline-flex items-center rounded-pill bg-label-normal font-medium text-background-normal"
            >
              앱 다운로드
              <LuArrowDown className="size-4" aria-hidden="true" />
            </a>
          </nav>
        </div>
        <div className="landing-scroll-progress" aria-hidden="true" />
      </header>

      <main id="main-content">
        <section
          data-landing-hero
          aria-labelledby="hero-title"
          className="max-w-7xl gap-10 px-6 pb-16 pt-10 sm:gap-14 sm:pb-20 sm:pt-12 lg:grid-cols-2 lg:gap-16 lg:px-12 lg:pb-20 mx-auto grid items-center"
        >
          <div data-hero-copy className="py-2 sm:py-8">
            <p className="text-label font-medium text-label-alternative">
              전화가 편해지는 연습, BADA
            </p>
            <h1
              id="hero-title"
              className="mt-6 sm:text-marketing-title lg:text-marketing-hero text-display1 font-bold"
            >
              전화 앞에서,
              <br />
              조금 더 나답게.
            </h1>
            <p className="mt-7 max-w-sm leading-relaxed text-body text-label-alternative">
              몇 번씩 고쳐 쓰던 첫마디도,
              <br />
              미루기만 했던 예약 전화도.
              <br />
              AI와 먼저 연습하면, 시작이 조금 가벼워져요.
            </p>
            <div className="mt-9 gap-5 flex flex-wrap items-center">
              <WebStartLink />
              <a
                href="#practice"
                className="min-h-12 gap-2 flex items-center text-label font-medium"
              >
                어떤 연습인지 볼까요?
                <LuArrowDown className="size-4" aria-hidden="true" />
              </a>
            </div>
            <p className="mt-5 text-caption text-label-alternative">
              설치 없이 웹에서 바로. 익숙해지면 앱으로 어디서든.
            </p>
          </div>
          <figure className="m-0 relative overflow-hidden rounded-dialog">
            <img
              data-hero-image
              src={heroImage}
              alt="햇빛이 드는 창가에서 편안하게 전화하는 일상을 표현한 이미지"
              width="1122"
              height="1402"
              fetchPriority="high"
              className="sm:aspect-square lg:aspect-[4/5] aspect-[4/5] w-full rounded-dialog object-cover"
            />
            <figcaption className="bottom-5 left-5 right-5 gap-4 p-4 backdrop-blur-sm sm:bottom-7 sm:left-7 sm:right-7 sm:p-5 absolute flex items-center rounded-component bg-background-normal/95">
              <span className="size-11 flex shrink-0 items-center justify-center rounded-pill bg-primary-normal text-label-strong">
                <LuPhone className="size-5" aria-hidden="true" />
              </span>
              <div>
                <p className="text-caption text-label-alternative">연습이 일상이 되는 순간</p>
                <p className="mt-1 text-body font-medium">“안녕하세요, 예약하고 싶어요.”</p>
              </div>
            </figcaption>
          </figure>
        </section>

        <TrainingPreview />
        <FeatureTour />

        <section
          data-reveal
          id="warmup"
          aria-labelledby="warmup-title"
          className="scroll-mt-24 px-6 py-14 lg:px-12 lg:py-16 border-y border-line-alternative bg-fill-normal"
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
          className="max-w-7xl scroll-mt-24 gap-9 px-6 py-16 sm:py-24 lg:grid-cols-3 lg:gap-16 lg:px-12 mx-auto grid"
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
