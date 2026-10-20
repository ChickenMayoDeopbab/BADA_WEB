import { tourFeatures } from '../model/landingContent'
import { useFeatureTour } from '../model/useFeatureTour'
import { callHintOptions } from '../model/practicePreview'
import { AppScreen } from './AppScreen'
import './featureTour.css'

/** 하나의 기기를 이동시키며 상황 선택·통화·리포트를 한 통의 이야기로 연결합니다. */
export const FeatureTour = () => {
  const {
    activeIndex,
    storyRef,
    isScrollStory,
    selectFeature,
    handleTabKeyDown,
    hintMode,
    setHintMode,
    isSceneChanging,
  } = useFeatureTour()
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
          <h2 id="experience-title">전화 한 통, 이렇게 연습해요.</h2>
          <div role="tablist" aria-label="BADA 기능 둘러보기" className="brand-tour-tabs">
            {tourFeatures.map((feature, index) => (
              <button
                key={feature.id}
                id={`feature-tab-${feature.id}`}
                role="tab"
                aria-label={feature.label}
                aria-selected={activeIndex === index}
                aria-controls={`feature-panel-${feature.id}`}
                tabIndex={activeIndex === index ? 0 : -1}
                onClick={() => selectFeature(index)}
                onKeyDown={(event) => handleTabKeyDown(event, index)}
              >
                <span aria-hidden="true">0{index + 1}</span>
                <span className="brand-tour-tab-label" aria-hidden="true">
                  {feature.label}
                </span>
              </button>
            ))}
          </div>
        </div>
        <div className="brand-tour-workspace">
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
                {feature.id === 'call' && (
                  <div
                    className="brand-tour-hints"
                    role="group"
                    aria-label="통화 도움 방식"
                    inert={isScrollStory && isSceneChanging}
                  >
                    {callHintOptions.map((option) => (
                      <button
                        key={option.id}
                        type="button"
                        aria-pressed={hintMode === option.id}
                        onClick={() => setHintMode(option.id)}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                )}
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
                    <AppScreen variant={feature.id} hintMode={hintMode} />
                  </div>
                ))}
                <span className="brand-tour-focus" aria-hidden="true" />
              </div>
              <div className="brand-tour-callout" data-tour-callout>
                <svg
                  className="brand-tour-connector brand-tour-connector-desktop"
                  viewBox="0 0 48 52"
                  aria-hidden="true"
                >
                  <path d="M4 44 H24 V20 H48" />
                  <circle cx="4" cy="44" r="3" />
                </svg>
                <svg
                  className="brand-tour-connector brand-tour-connector-mobile"
                  viewBox="0 0 56 32"
                  aria-hidden="true"
                >
                  <path d="M4 4 V16 H28 V32" />
                  <circle cx="4" cy="4" r="3" />
                </svg>
                <div className="brand-tour-callout-heading">
                  <span className="brand-tour-callout-index" aria-hidden="true">
                    0{activeIndex + 1}
                  </span>
                  <span>{currentFeature.eyebrow}</span>
                </div>
                <strong>{currentFeature.focusTitle}</strong>
                <p>
                  {activeIndex === 1
                    ? callHintOptions.find((option) => option.id === hintMode)!.description
                    : currentFeature.focusDescription}
                </p>
              </div>
            </div>
          </figure>
        </div>
      </div>
    </section>
  )
}
