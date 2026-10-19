import { Link } from 'react-router-dom'
import {
  LuArrowDown,
  LuArrowRight,
  LuCheck,
  LuDownload,
  LuLeaf,
  LuMonitor,
  LuPhone,
  LuPlus,
  LuSparkles,
} from 'react-icons/lu'
import { routePaths } from '@shared/config'
import logo from '@shared/assets/auth/logo.svg'
import { landingQuestions } from '../model/landingContent'
import { AppDownload } from './AppDownload'
import { FeatureTour } from './FeatureTour'
import { LandingFooter } from './LandingFooter'
import { TrainingPreview } from './TrainingPreview'
import { WebStartLink } from './WebStartLink'

const practiceSteps = [
  { number: '01', title: '나를 알아보기', description: '자가진단으로 지금 내 상태를 살펴봐요.' },
  {
    number: '02',
    title: '나에게 맞게 고르기',
    description: '필요한 상황과 상대방의 성향을 정해요.',
  },
  { number: '03', title: '부담 없이 말해보기', description: 'AI와 함께 나의 속도로 대화해요.' },
  {
    number: '04',
    title: '경험으로 쌓아가기',
    description: '피드백을 돌아보고 다음 연습을 준비해요.',
  },
]

/** 공개 체험과 실제 웹 이용, 앱 다운로드를 연결하는 랜딩 페이지를 구성합니다. */
export const LandingPage = () => (
  <div className="ux-page bg-background-normal text-label-normal [&_h1]:break-keep [&_h2]:break-keep [&_h3]:break-keep">
    <a
      href="#main-content"
      className="focus:left-4 focus:top-4 focus:p-4 sr-only focus:not-sr-only focus:fixed focus:z-50 focus:rounded-control focus:bg-background-normal"
    >
      본문으로 건너뛰기
    </a>
    <header className="top-0 backdrop-blur-sm sticky z-30 border-b border-line-alternative bg-background-normal/95">
      <div className="min-h-20 max-w-7xl gap-4 px-5 lg:px-10 mx-auto flex items-center justify-between">
        <Link to={routePaths.landing} aria-label="BADA 홈">
          <img src={logo} alt="BADA" className="h-6 sm:h-8 w-auto" />
        </Link>
        <nav aria-label="랜딩 메뉴" className="gap-4 sm:gap-6 flex items-center text-label">
          <a
            href="#experience"
            className="py-3 lg:block hidden text-label-alternative hover:text-label-normal"
          >
            BADA 둘러보기
          </a>
          <a
            href="#how-it-works"
            className="py-3 lg:block hidden text-label-alternative hover:text-label-normal"
          >
            이용 방법
          </a>
          <a href="#download" className="min-h-11 gap-2 flex items-center font-medium">
            <LuDownload className="size-4 sm:block hidden" aria-hidden="true" />앱 다운로드
          </a>
          <Link
            to={routePaths.login}
            className="py-3 text-label-alternative hover:text-label-normal"
          >
            로그인
          </Link>
          <div className="sm:block hidden">
            <WebStartLink>웹에서 시작</WebStartLink>
          </div>
        </nav>
      </div>
    </header>

    <main id="main-content">
      <section className="px-4 pt-5 sm:px-6 sm:pt-8 lg:px-8" aria-labelledby="hero-title">
        <div className="max-w-7xl gap-10 px-5 py-10 sm:p-10 lg:grid-cols-2 lg:gap-14 lg:p-16 relative mx-auto grid items-center overflow-hidden rounded-dialog bg-primary-alternative">
          <div className="relative z-10">
            <p className="gap-2 px-4 py-2 inline-flex items-center rounded-pill bg-background-normal text-caption font-medium text-label-neutral">
              <span className="size-2 rounded-pill bg-primary-normal" />
              AI와 함께하는 나만의 전화 연습
            </p>
            <h1 id="hero-title" className="mt-7 sm:text-display1 text-display2 font-bold">
              전화가 편해지는 <br />
              연습, Bada
            </h1>
            <p className="mt-5 text-headline2 font-medium text-label-neutral">
              머릿속 리허설을, 진짜 대화로.
            </p>
            <p className="mt-5 max-w-md leading-relaxed text-body text-label-alternative">
              예약 전화도, 업무 연락도, 처음 꺼내는 말도.
              <br className="sm:block hidden" />
              AI와 먼저 연습하고 내 일상으로 한 걸음 나아가요.
            </p>
            <div className="mt-8 gap-4 flex flex-wrap items-center">
              <WebStartLink />
              <a
                href="#experience"
                className="min-h-12 gap-2 px-2 inline-flex items-center text-label font-medium"
              >
                먼저 둘러볼게요
                <LuArrowDown className="size-4" aria-hidden="true" />
              </a>
            </div>
            <p className="mt-5 gap-2 flex items-center text-caption text-label-alternative">
              <LuMonitor className="size-4" aria-hidden="true" />
              설치 없이 웹에서 · 내 손안의 앱에서도
            </p>
            <div className="mt-10 gap-x-5 gap-y-3 pt-6 flex flex-wrap border-t border-label-alternative/20 text-caption text-label-neutral">
              {['나만의 속도로', '실수해도 괜찮게', '필요한 상황부터'].map((text) => (
                <span key={text} className="gap-1 flex items-center">
                  <LuCheck className="size-4" aria-hidden="true" />
                  {text}
                </span>
              ))}
            </div>
          </div>
          <div className="relative">
            <TrainingPreview />
          </div>
        </div>
      </section>

      <section
        className="max-w-5xl px-6 pb-4 pt-16 sm:pt-20 mx-auto text-center"
        aria-labelledby="empathy-title"
      >
        <p className="text-label font-medium text-label-alternative">
          전화 한 통에도, 마음의 준비가 필요하니까.
        </p>
        <h2 id="empathy-title" className="mt-4 sm:text-display2 text-title1 font-bold">
          잘해야 한다는 부담은 잠시 내려놓고,
          <br className="sm:block hidden" />한 번 해보는 것부터 시작해요.
        </h2>
        <div className="mt-7 gap-3 flex flex-wrap justify-center">
          {[
            '통화 버튼 앞에서 망설일 때',
            '할 말을 몇 번씩 적어볼 때',
            '끝난 대화가 자꾸 떠오를 때',
          ].map((text) => (
            <span
              key={text}
              className="px-5 py-3 rounded-pill bg-fill-field text-label text-label-alternative"
            >
              {text}
            </span>
          ))}
        </div>
      </section>

      <FeatureTour />

      <section
        id="warmup"
        aria-labelledby="warmup-title"
        className="scroll-mt-28 px-6 py-16 sm:py-20 lg:px-10 border-y border-line-alternative bg-fill-normal"
      >
        <div className="max-w-6xl gap-10 lg:grid-cols-2 lg:gap-20 mx-auto grid items-center">
          <div className="p-8 sm:p-12 lg:order-1 order-2 flex items-center justify-center rounded-dialog bg-primary-alternative">
            <div className="max-w-64 p-6 flex aspect-square w-full flex-col items-center justify-center rounded-pill border border-label-alternative/20 bg-background-normal/60 text-center">
              <LuLeaf className="size-9" aria-hidden="true" />
              <p className="mt-5 text-display1 font-bold">30초</p>
              <p className="mt-2 text-label text-label-neutral">
                가벼운 통화로 시작하는
                <br />
                나만의 워밍업
              </p>
              <div className="mt-5 gap-2 flex items-center text-caption text-label-alternative">
                <LuPhone className="size-3" aria-hidden="true" />
                AI 통화 연습
              </div>
            </div>
          </div>
          <div className="lg:order-2 order-1">
            <p className="text-label font-medium text-label-alternative">A LITTLE WARM-UP</p>
            <h2 id="warmup-title" className="mt-4 sm:text-display2 text-title1 font-bold">
              처음부터 긴 통화가
              <br />
              아니어도 괜찮아요.
            </h2>
            <p className="mt-5 leading-relaxed text-body text-label-alternative">
              아직은 통화 버튼을 누르기 어렵다면,
              <br />
              짧은 30초 워밍업으로 가볍게 시작해 보세요.
              <br />
              상대와 목적을 정하고 첫마디를 꺼내는 연습부터.
            </p>
            <WebStartLink destination={routePaths.trainingWarmup} className="mt-7">
              워밍업 시작하기
            </WebStartLink>
          </div>
        </div>
      </section>

      <section
        id="how-it-works"
        aria-labelledby="steps-title"
        className="max-w-6xl scroll-mt-28 px-6 py-20 sm:py-24 lg:px-10 mx-auto"
      >
        <div className="text-center">
          <p className="text-label font-medium text-label-alternative">YOUR FIRST STEP</p>
          <h2 id="steps-title" className="mt-4 sm:text-display2 text-title1 font-bold">
            첫 연습에서, 다음 전화까지.
          </h2>
        </div>
        <ol className="mt-12 gap-8 sm:grid-cols-2 lg:grid-cols-4 grid">
          {practiceSteps.map(({ number, title, description }) => (
            <li key={number} className="pt-6 border-t border-line-neutral">
              <span className="size-10 flex items-center justify-center rounded-pill bg-primary-alternative text-label font-bold">
                {number}
              </span>
              <h3 className="mt-5 text-headline2 font-bold">{title}</h3>
              <p className="mt-3 leading-relaxed text-label text-label-alternative">
                {description}
              </p>
            </li>
          ))}
        </ol>
        <div className="mt-10 text-center">
          <WebStartLink>나의 첫 연습 시작하기</WebStartLink>
        </div>
      </section>

      <section
        className="px-6 py-14 lg:px-10 border-y border-line-alternative"
        aria-labelledby="web-title"
      >
        <div className="max-w-6xl gap-7 mx-auto flex flex-wrap items-center justify-between">
          <div className="gap-4 flex items-start">
            <span className="size-12 flex shrink-0 items-center justify-center rounded-component bg-primary-alternative">
              <LuMonitor className="size-6" aria-hidden="true" />
            </span>
            <div>
              <h2 id="web-title" className="text-title2 font-bold">
                지금 보고 있는 이 웹에서도.
              </h2>
              <p className="mt-3 leading-relaxed text-label text-label-alternative">
                소개에서 끝나지 않아요. 로그인하고 실제 BADA 기능을 이용해 보세요.
              </p>
            </div>
          </div>
          <WebStartLink />
        </div>
      </section>

      <section
        id="faq"
        aria-labelledby="faq-title"
        className="max-w-6xl scroll-mt-28 gap-8 px-6 py-20 sm:py-24 lg:grid-cols-3 lg:gap-14 lg:px-10 mx-auto grid"
      >
        <div>
          <p className="text-label font-medium text-label-alternative">BEFORE YOU START</p>
          <h2 id="faq-title" className="mt-4 text-title1 font-bold">
            궁금한 점이 있나요?
          </h2>
          <a
            href="mailto:team.bada.service@gmail.com"
            className="mt-5 min-h-11 gap-2 inline-flex items-center text-label text-label-alternative"
          >
            BADA 팀에 문의하기
            <LuArrowRight className="size-4" aria-hidden="true" />
          </a>
        </div>
        <div className="lg:col-span-2">
          {landingQuestions.map(({ question, answer }) => (
            <details
              key={question}
              className="group border-b border-line-alternative first:border-t"
            >
              <summary className="gap-5 py-6 flex cursor-pointer list-none items-center justify-between text-body font-medium [&::-webkit-details-marker]:hidden">
                {question}
                <LuPlus
                  className="size-5 shrink-0 transition-transform group-open:rotate-45 motion-reduce:transition-none"
                  aria-hidden="true"
                />
              </summary>
              <p className="pb-6 pr-7 leading-relaxed text-label text-label-alternative">
                {answer}
              </p>
            </details>
          ))}
        </div>
      </section>

      <section className="px-6 pb-12 text-center" aria-labelledby="closing-title">
        <LuSparkles className="size-7 mx-auto text-label-alternative" aria-hidden="true" />
        <h2 id="closing-title" className="mt-4 sm:text-display2 text-title1 font-bold">
          다음 전화는 조금 더 편안하게.
        </h2>
        <p className="mt-4 leading-relaxed text-body text-label-alternative">
          오늘의 작은 연습이, 내일의 나에게 용기가 되도록.
        </p>
      </section>
      <AppDownload />
    </main>
    <LandingFooter />
  </div>
)
