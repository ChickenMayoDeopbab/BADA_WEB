import { LuCheck, LuHeart, LuMessageCircle, LuSparkles } from 'react-icons/lu'
import { tourFeatures } from '../model/landingContent'
import { useFeatureTour } from '../model/useFeatureTour'
import { AppScreen } from './AppScreen'
import { WebStartLink } from './WebStartLink'

interface FeatureTourPreviewProps {
  feature: (typeof tourFeatures)[number]['id']
}

/** 실제 기능 구성을 바탕으로 탭별 화면 예시를 표시합니다. */
const FeatureTourPreview = ({ feature }: FeatureTourPreviewProps) => (
  <div className="landing-feature-visual min-h-80">
    <div className="landing-visual-chrome mb-7 gap-3 flex items-center justify-between text-caption text-label-alternative">
      <span className="gap-2 flex items-center">
        <span className="size-2 rounded-pill bg-primary-normal" />
        BADA
      </span>
      <span>기능 화면 예시</span>
    </div>
    {feature === 'diagnosis' && (
      <div>
        <p className="landing-visual-context text-label text-label-alternative">
          나를 돌아보는 질문
        </p>
        <h3 className="mt-3 text-title2 font-bold">
          전화를 걸기 전,
          <br />
          어떤 기분이 드나요?
        </h3>
        <p className="landing-visual-description mt-4 leading-relaxed text-label text-label-alternative">
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
              className="gap-3 py-4 flex items-center border-b border-line-alternative text-label"
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
      <div className="feature-phone-art feature-phone-pair">
        <AppScreen variant="scenario" />
        <AppScreen variant="call" />
      </div>
    )}
    {feature === 'records' && (
      <div className="feature-phone-art feature-phone-report">
        <AppScreen variant="report" />
        <div className="feature-report-caption">
          <LuSparkles aria-hidden="true" />
          <span>잘한 순간을 발견하는 피드백</span>
        </div>
      </div>
    )}
    {feature === 'community' && (
      <div>
        <p className="landing-visual-context text-label text-label-alternative">
          우리의 연습 이야기
        </p>
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
                className="gap-3 py-5 flex items-center justify-between border-b border-line-alternative"
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
  const { activeIndex, storyRef, isScrollStory, selectFeature, handleTabKeyDown } = useFeatureTour()
  return (
    <section
      ref={storyRef}
      data-scroll-story={isScrollStory}
      id="experience"
      className="landing-feature-story scroll-mt-24 px-6 py-20 sm:py-32 lg:px-12"
      aria-labelledby="experience-title"
    >
      <div data-feature-stage className="landing-feature-stage max-w-6xl mx-auto">
        <div id="how-it-works" className="landing-feature-intro scroll-mt-24">
          <p className="text-label font-medium text-label-alternative">BADA의 연습 방식</p>
          <h2
            id="experience-title"
            className="mt-4 sm:text-marketing-title text-display2 font-bold"
          >
            나를 알고, 연습하고,
            <br />
            다음 전화를 준비하는 것까지.
          </h2>
          <p className="landing-feature-guide mt-4 leading-relaxed text-body text-label-alternative">
            {isScrollStory
              ? `스크롤하며 살펴보세요 · ${String(activeIndex + 1).padStart(2, '0')} / 04`
              : '마음의 준비부터 연습 후 돌아보기까지. 필요한 순간을 선택해 보세요.'}
          </p>
        </div>
        <div
          role="tablist"
          aria-label="BADA 기능 둘러보기"
          className="landing-feature-tabs mt-10 gap-x-5 sm:grid-cols-4 grid grid-cols-2"
        >
          {tourFeatures.map(({ id, label }, index) => (
            <button
              type="button"
              key={id}
              id={`feature-tab-${id}`}
              role="tab"
              data-step-state={
                index < activeIndex ? 'complete' : index === activeIndex ? 'active' : 'upcoming'
              }
              aria-selected={activeIndex === index}
              aria-controls={`feature-panel-${id}`}
              tabIndex={activeIndex === index ? 0 : -1}
              onClick={() => selectFeature(index)}
              onKeyDown={(event) => handleTabKeyDown(event, index)}
              className={`landing-feature-tab min-h-14 px-0 py-4 border-b-2 text-left text-body font-medium transition-colors ${activeIndex === index ? 'border-label-normal text-label-normal' : 'border-line-alternative text-label-alternative hover:text-label-normal'}`}
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
            className={`landing-feature-panel mt-10 gap-8 sm:mt-12 lg:grid-cols-2 lg:gap-16 items-center ${activeIndex === index ? 'grid' : 'hidden'}`}
          >
            <div className="landing-feature-copy">
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
