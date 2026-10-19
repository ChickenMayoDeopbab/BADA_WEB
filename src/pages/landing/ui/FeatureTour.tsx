import { tourFeatures } from '../model/landingContent'
import { useFeatureTour } from '../model/useFeatureTour'
import { AppScreen } from './AppScreen'
import { WebStartLink } from './WebStartLink'
import './featureTour.css'

/** 하나의 기기를 이동시키며 상황 선택·통화·리포트를 한 통의 이야기로 연결합니다. */
export const FeatureTour = () => {
  const { activeIndex, storyRef, isScrollStory, selectFeature, handleTabKeyDown } = useFeatureTour()
  const currentFeature = tourFeatures[activeIndex]
  return (
    <section
      id="experience"
      ref={storyRef}
      className="brand-tour"
      data-scroll-story={isScrollStory}
      data-active-scene={activeIndex}
      aria-labelledby="experience-title"
    >
      <div className="brand-tour-stage" data-feature-stage>
        <div className="brand-tour-heading">
          <p className="brand-kicker">02 / 한 통의 흐름</p>
          <h2 id="experience-title">고르고. 말하고. 돌아보고.</h2>
          <p className="brand-tour-instruction">
            스크롤을 따라, 나의 첫 통화를 만나보세요. <span aria-hidden="true">↓</span>
          </p>
        </div>
        <div className="brand-tour-workspace">
          <svg
            className="brand-tour-route"
            viewBox="0 0 1400 700"
            preserveAspectRatio="none"
            fill="none"
            aria-hidden="true"
          >
            <path d="M 1060 200 C 1230 610 290 670 330 330 S 1020 80 1060 360" pathLength="1" />
          </svg>
          <span className="brand-tour-number" aria-hidden="true">
            0{activeIndex + 1}
          </span>
          {tourFeatures.map((feature, index) => (
            <div
              key={feature.id}
              role="tabpanel"
              id={`feature-panel-${feature.id}`}
              aria-labelledby={`feature-tab-${feature.id}`}
              hidden={activeIndex !== index}
              className="brand-tour-panel"
            >
              <div className="brand-tour-copy">
                <p className="brand-kicker">{feature.eyebrow}</p>
                <h3>{feature.title}</h3>
                <p className="brand-tour-description">{feature.description}</p>
                <WebStartLink destination={feature.destination}>{feature.action}</WebStartLink>
              </div>
            </div>
          ))}
          <figure
            className="brand-tour-visual"
            aria-label="한 통의 연습을 따라 움직이는 앱 미리보기"
          >
            <div className="brand-tour-carrier" data-tour-carrier>
              <div className="brand-tour-device" data-tour-device>
                {tourFeatures.map((feature, index) => (
                  <div
                    key={feature.id}
                    className="brand-tour-screen"
                    data-current={activeIndex === index}
                    aria-hidden={activeIndex !== index}
                  >
                    <AppScreen variant={feature.id} />
                  </div>
                ))}
                <span className="brand-tour-focus" aria-hidden="true" />
              </div>
              <div className="brand-tour-callout" data-tour-callout>
                <span className="brand-tour-callout-index" aria-hidden="true">
                  0{activeIndex + 1}
                </span>
                <span>
                  <strong>{currentFeature.focusTitle}</strong>
                  <small>{currentFeature.focusDescription}</small>
                </span>
              </div>
            </div>
            <figcaption>{currentFeature.annotation}</figcaption>
          </figure>
        </div>
        <div role="tablist" aria-label="BADA 기능 둘러보기" className="brand-tour-tabs">
          {tourFeatures.map((feature, index) => (
            <button
              key={feature.id}
              id={`feature-tab-${feature.id}`}
              role="tab"
              aria-selected={activeIndex === index}
              aria-controls={`feature-panel-${feature.id}`}
              tabIndex={activeIndex === index ? 0 : -1}
              onClick={() => selectFeature(index)}
              onKeyDown={(event) => handleTabKeyDown(event, index)}
            >
              <span aria-hidden="true">0{index + 1}</span>
              {feature.label}
              <small aria-hidden="true">{feature.phase}</small>
            </button>
          ))}
        </div>
        <div className="brand-tour-progress" aria-hidden="true">
          <span />
        </div>
      </div>
    </section>
  )
}
