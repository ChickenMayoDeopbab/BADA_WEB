import { tourFeatures } from '../model/landingContent'
import { useFeatureTour } from '../model/useFeatureTour'
import { AppScreen } from './AppScreen'
import { WebStartLink } from './WebStartLink'

/** 한 개의 고정 무대에서 실제 앱 UI 세 장면을 마스크로 교체합니다. */
export const FeatureTour = () => {
  const { activeIndex, storyRef, isScrollStory, selectFeature, handleTabKeyDown } = useFeatureTour()
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
          <p className="brand-kicker">02 / 연습의 순간들</p>
          <h2 id="experience-title">
            당신의 일상이
            <br />
            연습의 무대가 되도록.
          </h2>
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
            </button>
          ))}
        </div>
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
            <figure className="brand-tour-visual">
              <span className="brand-tour-number" aria-hidden="true">
                0{index + 1}
              </span>
              <div className="brand-tour-device">
                <AppScreen variant={feature.id} />
              </div>
              <figcaption>{feature.annotation}</figcaption>
            </figure>
          </div>
        ))}
        <div className="brand-tour-progress" aria-hidden="true">
          <span />
        </div>
      </div>
    </section>
  )
}
