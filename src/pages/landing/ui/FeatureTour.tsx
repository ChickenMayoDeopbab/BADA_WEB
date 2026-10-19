import {
  LuArrowUpRight,
  LuAudioLines,
  LuCalendarDays,
  LuCheck,
  LuHeart,
  LuMessageCircle,
  LuPhone,
  LuSparkles,
} from 'react-icons/lu'
import { tourFeatures } from '../model/landingContent'
import { useFeatureTour } from '../model/useFeatureTour'
import { WebStartLink } from './WebStartLink'

interface FeatureTourPreviewProps {
  feature: (typeof tourFeatures)[number]['id']
}

/** 실제 기능 구성을 바탕으로 탭별 화면 예시를 표시합니다. */
const FeatureTourPreview = ({ feature }: FeatureTourPreviewProps) => (
  <div className="p-6 sm:p-8 rounded-card bg-background-normal shadow-surface-card">
    <div className="mb-7 gap-3 flex items-center justify-between text-caption text-label-alternative">
      <span className="gap-2 flex items-center">
        <span className="size-2 rounded-pill bg-primary-normal" />
        BADA
      </span>
      <span>기능 화면 예시</span>
    </div>
    {feature === 'diagnosis' && (
      <div>
        <p className="text-label text-label-alternative">나를 돌아보는 질문</p>
        <h3 className="mt-3 text-title2 font-bold">
          전화를 걸기 전,
          <br />
          어떤 기분이 드나요?
        </h3>
        <p className="mt-4 leading-relaxed text-label text-label-alternative">
          내가 느끼는 긴장과 생각을 살펴보고,
          <br />
          지금의 상태를 알아가요.
        </p>
        <div className="mt-7 space-y-3">
          {[
            '전화를 앞두고 긴장이 돼요',
            '어떤 말을 할지 미리 준비해요',
            '내 마음을 조금 더 알아보고 싶어요',
          ].map((text) => (
            <p
              key={text}
              className="gap-3 p-4 flex items-center rounded-component bg-fill-normal text-label"
            >
              <LuMessageCircle
                className="size-4 shrink-0 text-label-alternative"
                aria-hidden="true"
              />
              {text}
            </p>
          ))}
        </div>
      </div>
    )}
    {feature === 'training' && (
      <div>
        <p className="text-label text-label-alternative">오늘은 어떤 전화를 연습할까요?</p>
        <h3 className="mt-3 text-title2 font-bold">
          필요한 상황부터,
          <br />
          나만의 상황까지.
        </h3>
        <div className="mt-7 gap-3 grid grid-cols-2">
          {['일상 속 예약', '업무 일정 조율', '학교 생활', '맞춤 시나리오'].map((text) => (
            <p
              key={text}
              className="min-h-24 gap-4 p-4 flex flex-col justify-between rounded-component bg-fill-normal text-label"
            >
              <LuPhone className="size-5" aria-hidden="true" />
              {text}
            </p>
          ))}
        </div>
        <a
          href="#warmup"
          className="mt-5 min-h-11 gap-3 flex items-center justify-between text-label font-medium"
        >
          아직 긴장된다면, 워밍업부터
          <LuArrowUpRight aria-hidden="true" />
        </a>
      </div>
    )}
    {feature === 'records' && (
      <div>
        <p className="text-label text-label-alternative">연습이 끝난 뒤</p>
        <h3 className="mt-3 text-title2 font-bold">
          대화 속 잘한 순간을
          <br />
          다시 발견해요.
        </h3>
        <div className="mt-7 p-5 rounded-component bg-primary-alternative">
          <p className="gap-2 flex items-center text-label font-bold">
            <LuSparkles aria-hidden="true" />
            구간별 피드백
          </p>
          <p className="mt-3 leading-relaxed text-label text-label-neutral">
            인사 후 용건을 먼저 전달한 부분을 돌아봐요.
          </p>
          <p className="mt-3 text-caption text-label-alternative">피드백 문구 예시</p>
        </div>
        <div className="mt-3 gap-4 p-5 flex items-center rounded-component bg-fill-normal">
          <LuCalendarDays className="size-6 shrink-0" aria-hidden="true" />
          <div>
            <p className="text-label font-medium">하루의 연습이 나만의 기록으로</p>
            <p className="mt-2 text-caption text-label-alternative">
              통화 기록 · 주간 리포트 · 출석
            </p>
          </div>
        </div>
        <p className="mt-5 gap-2 flex items-center text-label text-label-alternative">
          <LuAudioLines aria-hidden="true" />
          발화 안정성 · 대화 완성도 · 유창성
        </p>
      </div>
    )}
    {feature === 'community' && (
      <div>
        <p className="text-label text-label-alternative">우리의 연습 이야기</p>
        <h3 className="mt-3 text-title2 font-bold">
          작은 시도를
          <br />
          함께 응원하는 곳.
        </h3>
        <div className="mt-7 space-y-3">
          {['오늘의 첫 도전 이야기', '나만의 전화 준비 방법', '연습하며 궁금했던 점'].map(
            (text) => (
              <div
                key={text}
                className="gap-3 p-5 flex items-center justify-between rounded-component bg-fill-normal"
              >
                <span className="text-label">{text}</span>
                <LuHeart className="size-4 shrink-0" aria-hidden="true" />
              </div>
            ),
          )}
        </div>
        <p className="mt-5 gap-2 flex items-center text-caption text-label-alternative">
          <LuCheck aria-hidden="true" />
          게시물 제목은 소개를 위한 예시입니다.
        </p>
      </div>
    )}
  </div>
)

/** 키보드로도 탐색할 수 있는 네 가지 핵심 기능 소개를 구성합니다. */
export const FeatureTour = () => {
  const { activeIndex, selectFeature, handleTabKeyDown } = useFeatureTour()
  return (
    <section
      id="experience"
      className="scroll-mt-28 px-6 py-20 sm:py-24 lg:px-10"
      aria-labelledby="experience-title"
    >
      <div className="max-w-6xl mx-auto">
        <div className="text-center">
          <p className="text-label font-medium text-label-alternative">MEET BADA</p>
          <h2 id="experience-title" className="mt-4 sm:text-display1 text-title1 font-bold">
            설명보다, 한 번의 경험으로.
          </h2>
          <p className="mt-4 leading-relaxed text-body text-label-alternative">
            궁금한 기능을 눌러보세요. 연습의 흐름이 한눈에 보여요.
          </p>
        </div>
        <div
          role="tablist"
          aria-label="BADA 기능 둘러보기"
          className="mt-9 max-w-2xl gap-2 p-2 sm:grid-cols-4 mx-auto grid grid-cols-2 rounded-card bg-fill-field"
        >
          {tourFeatures.map(({ id, label }, index) => (
            <button
              type="button"
              key={id}
              id={`feature-tab-${id}`}
              role="tab"
              aria-selected={activeIndex === index}
              aria-controls={`feature-panel-${id}`}
              tabIndex={activeIndex === index ? 0 : -1}
              onClick={() => selectFeature(index)}
              onKeyDown={(event) => handleTabKeyDown(event, index)}
              className={`min-h-12 px-3 py-3 rounded-component text-label font-medium transition-colors ${activeIndex === index ? 'bg-background-normal text-label-normal shadow-subtle-card' : 'text-label-alternative hover:text-label-normal'}`}
            >
              {label}
            </button>
          ))}
        </div>
        {tourFeatures.map((feature, index) => (
          <div
            key={feature.id}
            id={`feature-panel-${feature.id}`}
            role="tabpanel"
            aria-labelledby={`feature-tab-${feature.id}`}
            hidden={activeIndex !== index}
            className={`mt-8 gap-8 p-6 sm:p-10 lg:grid-cols-2 lg:gap-14 lg:p-14 items-center rounded-dialog bg-fill-normal ${activeIndex === index ? 'grid' : 'hidden'}`}
          >
            <div>
              <p className="text-label font-medium text-label-alternative">{feature.eyebrow}</p>
              <h3 className="mt-5 sm:text-display2 text-title1 font-bold whitespace-pre-line">
                {feature.title}
              </h3>
              <p className="mt-5 max-w-md leading-relaxed text-body text-label-alternative">
                {feature.description}
              </p>
              <WebStartLink destination={feature.destination} className="mt-8">
                {feature.action}
              </WebStartLink>
              <p className="mt-3 text-caption text-label-alternative">
                로그인 후 실제 기능을 이용할 수 있어요.
              </p>
            </div>
            <FeatureTourPreview feature={feature.id} />
          </div>
        ))}
      </div>
    </section>
  )
}
