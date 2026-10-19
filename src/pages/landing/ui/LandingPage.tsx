import { Link } from 'react-router-dom'
import {
  LuArrowRight,
  LuArrowUpRight,
  LuChartColumn,
  LuCheck,
  LuLeaf,
  LuMessageCircle,
  LuPlus,
} from 'react-icons/lu'
import { routePaths } from '@shared/config'
import logo from '@shared/assets/auth/logo.svg'
import { TrainingPreview } from './TrainingPreview'

const primaryLinkClassName =
  'inline-flex min-h-12 items-center justify-center gap-3 rounded-control bg-primary-normal px-6 py-3 text-body font-bold text-label-strong transition-colors hover:bg-primary-normal/80'

const features = [
  {
    number: '01',
    icon: LuMessageCircle,
    title: '내 일상에 필요한 대화부터',
    description: '예약, 문의, 업무 전화까지. 연습하고 싶은 상황을 골라 AI와 대화해 보세요.',
    tag: '상황별 통화 연습',
  },
  {
    number: '02',
    icon: LuLeaf,
    title: '긴장은 내려놓고, 가볍게',
    description: '바로 통화하기가 부담스럽다면 짧은 워밍업으로 먼저 시작해 보세요.',
    tag: '통화 전 워밍업',
  },
  {
    number: '03',
    icon: LuChartColumn,
    title: '작은 변화도 놓치지 않게',
    description: '연습이 끝나면 기록과 피드백을 확인하고, 다음 연습을 이어가 보세요.',
    tag: '기록과 피드백',
  },
]

const steps = [
  { title: '내 상태 알아보기', description: '자가진단으로 지금의 나를 살펴봐요.' },
  { title: '연습할 상황 고르기', description: '내게 필요한 전화 상황을 선택해요.' },
  { title: 'AI와 대화해 보기', description: '부담 없이 내 속도로 연습해요.' },
  { title: '피드백 돌아보기', description: '기록을 확인하고 다음 연습을 준비해요.' },
]

const questions = [
  {
    question: '전화를 잘 못해도 시작할 수 있나요?',
    answer:
      '네. 처음부터 유창하게 말할 필요는 없어요. 짧은 워밍업이나 익숙한 일상 상황부터 골라 나의 속도에 맞게 연습해 보세요.',
  },
  {
    question: '실제 사람에게 전화를 거는 건가요?',
    answer: 'BADA의 통화 연습은 AI와 대화하는 방식이에요. 연습 상황 속 상대방 역할을 AI가 맡아요.',
  },
  {
    question: '어떤 상황을 연습할 수 있나요?',
    answer:
      '일상, 학교, 업무 등 여러 상황의 시나리오를 선택할 수 있어요. 직접 상황을 만드는 맞춤 시나리오도 이용해 보세요.',
  },
]

/** 서비스 소개부터 회원가입까지 공개 랜딩 페이지의 기본 흐름을 구성합니다. */
export const LandingPage = () => (
  <div className="ux-page bg-background-normal text-label-normal">
    <a
      href="#main-content"
      className="focus:p-4 sr-only focus:not-sr-only focus:absolute focus:z-10 focus:rounded-control focus:bg-background-normal"
    >
      본문으로 건너뛰기
    </a>
    <header className="border-b border-line-alternative">
      <div className="min-h-20 max-w-6xl gap-4 px-6 lg:px-10 mx-auto flex items-center justify-between">
        <Link to={routePaths.landing} aria-label="BADA 홈">
          <img src={logo} alt="BADA" className="h-7 sm:h-8 w-auto" />
        </Link>
        <nav aria-label="랜딩 메뉴" className="gap-5 sm:gap-8 flex items-center text-label">
          <a
            href="#features"
            className="sm:block hidden text-label-alternative hover:text-label-normal"
          >
            서비스 소개
          </a>
          <a
            href="#how-it-works"
            className="sm:block hidden text-label-alternative hover:text-label-normal"
          >
            이용 방법
          </a>
          <Link to={routePaths.login} className="py-3 font-medium">
            로그인
          </Link>
          <Link
            to={routePaths.signup}
            className="px-4 py-3 rounded-control bg-label-normal font-medium text-background-normal"
          >
            시작하기
          </Link>
        </nav>
      </div>
    </header>

    <main id="main-content">
      <section
        className="max-w-6xl gap-12 px-6 py-16 sm:py-20 lg:grid-cols-2 lg:gap-16 lg:px-10 lg:py-24 mx-auto grid items-center"
        aria-labelledby="hero-title"
      >
        <div>
          <p className="mb-6 gap-2 flex items-center text-label font-medium text-label-alternative">
            <span className="size-2 rounded-pill bg-primary-normal" />
            전화 앞에서 망설이는 당신에게
          </p>
          <h1 id="hero-title" className="sm:text-display1 text-display2 font-bold">
            전화가 편해지는 <br />
            연습,{' '}
            <span className="underline decoration-primary-normal decoration-4 underline-offset-8">
              Bada
            </span>
          </h1>
          <p className="mt-6 max-w-sm leading-relaxed text-body text-label-alternative">
            무슨 말을 할지, 어떻게 시작할지 고민되나요?
            <br className="sm:block hidden" />
            부담스러운 전화, AI와 먼저 연습해 보세요.
          </p>
          <div className="mt-8 gap-5 flex flex-wrap items-center">
            <Link to={routePaths.signup} className={primaryLinkClassName}>
              나의 첫 연습 시작하기 <LuArrowUpRight className="size-5" aria-hidden="true" />
            </Link>
            <a
              href="#how-it-works"
              className="min-h-12 gap-2 inline-flex items-center text-label text-label-neutral"
            >
              어떻게 연습하나요? <LuArrowRight className="size-4" aria-hidden="true" />
            </a>
          </div>
          <p className="mt-6 gap-2 flex items-center text-caption text-label-alternative">
            <LuCheck className="size-4" aria-hidden="true" />
            실제 전화 전, 나만을 위한 연습 공간
          </p>
        </div>
        <TrainingPreview />
      </section>

      <section
        className="px-6 py-12 sm:py-16 border-y border-line-alternative bg-fill-normal text-center"
        aria-labelledby="empathy-title"
      >
        <p className="text-label text-label-alternative">이런 순간, 익숙한가요?</p>
        <h2 id="empathy-title" className="mt-4 sm:text-title1 text-title2 font-bold">
          전화 한 통에도, 마음의 준비가 필요하니까.
        </h2>
        <div className="mt-8 max-w-4xl gap-3 mx-auto flex flex-wrap justify-center text-label text-label-neutral">
          {[
            '통화 버튼 앞에서 망설일 때',
            '할 말을 미리 적어두게 될 때',
            '끝난 대화가 자꾸 떠오를 때',
          ].map((text) => (
            <p
              key={text}
              className="px-5 py-3 rounded-pill border border-line-alternative bg-background-normal"
            >
              {text}
            </p>
          ))}
        </div>
      </section>

      <section
        id="features"
        className="max-w-6xl scroll-mt-8 px-6 py-16 sm:py-20 lg:px-10 mx-auto"
        aria-labelledby="features-title"
      >
        <p className="text-label font-medium text-label-alternative">
          부담은 조금 덜고, 경험은 하나씩
        </p>
        <h2 id="features-title" className="mt-3 sm:text-display2 text-title1 font-bold">
          나에게 맞는 속도로 연습해요.
        </h2>
        <div className="mt-10 gap-4 md:grid-cols-3 grid">
          {features.map(({ number, icon: Icon, title, description, tag }) => (
            <article key={number} className="p-7 flex flex-col rounded-card bg-fill-normal">
              <div className="flex items-center justify-between">
                <Icon className="size-7 text-label-normal" aria-hidden="true" />
                <span className="text-caption text-label-alternative">{number}</span>
              </div>
              <p className="mt-10 text-caption font-medium text-label-alternative">{tag}</p>
              <h3 className="mt-3 text-headline2 font-bold">{title}</h3>
              <p className="mt-3 leading-relaxed text-label text-label-alternative">
                {description}
              </p>
            </article>
          ))}
        </div>
      </section>

      <section
        id="how-it-works"
        className="scroll-mt-8 border-y border-line-alternative"
        aria-labelledby="steps-title"
      >
        <div className="max-w-6xl px-6 py-16 sm:py-20 lg:px-10 mx-auto">
          <div className="gap-5 flex flex-wrap items-end justify-between">
            <div>
              <p className="text-label text-label-alternative">BADA 이용 방법</p>
              <h2 id="steps-title" className="mt-3 sm:text-display2 text-title1 font-bold">
                첫 연습은 이렇게 시작해요.
              </h2>
            </div>
            <Link
              to={routePaths.signup}
              className="min-h-11 gap-2 inline-flex items-center text-label font-medium"
            >
              시작해 보기 <LuArrowUpRight className="size-4" aria-hidden="true" />
            </Link>
          </div>
          <ol className="mt-10 gap-8 sm:grid-cols-2 lg:grid-cols-4 grid">
            {steps.map(({ title, description }, index) => (
              <li key={title}>
                <span className="size-10 flex items-center justify-center rounded-pill bg-primary-alternative text-label font-bold">
                  {String(index + 1).padStart(2, '0')}
                </span>
                <h3 className="mt-5 text-headline2 font-bold">{title}</h3>
                <p className="mt-3 leading-relaxed text-label text-label-alternative">
                  {description}
                </p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section
        className="max-w-6xl gap-8 px-6 py-16 sm:py-20 lg:grid-cols-3 lg:gap-16 lg:px-10 mx-auto grid"
        aria-labelledby="faq-title"
      >
        <div>
          <p className="text-label text-label-alternative">시작하기 전에</p>
          <h2 id="faq-title" className="mt-3 text-title1 font-bold">
            궁금한 점이 있나요?
          </h2>
        </div>
        <div className="lg:col-span-2">
          {questions.map(({ question, answer }) => (
            <details
              key={question}
              className="group border-b border-line-alternative first:border-t"
            >
              <summary className="gap-5 py-6 flex cursor-pointer list-none items-center justify-between text-body font-medium [&::-webkit-details-marker]:hidden">
                {question}
                <LuPlus className="size-5 shrink-0 group-open:rotate-45" aria-hidden="true" />
              </summary>
              <p className="pb-6 pr-8 leading-relaxed text-label text-label-alternative">
                {answer}
              </p>
            </details>
          ))}
        </div>
      </section>

      <section
        className="px-6 py-16 sm:py-20 bg-primary-alternative text-center"
        aria-labelledby="start-title"
      >
        <p className="text-label text-label-neutral">잘하려는 마음보다, 한 번 해보는 마음으로</p>
        <h2 id="start-title" className="mt-4 sm:text-display2 text-title1 font-bold">
          다음 전화는 조금 더 편안하게.
        </h2>
        <p className="mt-4 text-body text-label-alternative">
          오늘의 작은 연습을 BADA와 시작해 보세요.
        </p>
        <Link to={routePaths.signup} className={`${primaryLinkClassName} mt-8`}>
          연습 시작하기 <LuArrowUpRight className="size-5" aria-hidden="true" />
        </Link>
      </section>
    </main>

    <footer className="max-w-6xl gap-6 px-6 py-8 lg:px-10 mx-auto flex flex-wrap items-center justify-between">
      <div className="gap-4 flex flex-wrap items-center">
        <img src={logo} alt="BADA" className="h-5 w-auto" />
        <p className="text-caption text-label-alternative">전화가 편해지는 연습</p>
      </div>
      <nav aria-label="하단 메뉴" className="gap-6 flex text-caption text-label-alternative">
        <a href="#features" className="py-3">
          서비스 소개
        </a>
        <Link to={routePaths.login} className="py-3">
          로그인
        </Link>
        <Link to={routePaths.signup} className="py-3">
          회원가입
        </Link>
      </nav>
    </footer>
  </div>
)
