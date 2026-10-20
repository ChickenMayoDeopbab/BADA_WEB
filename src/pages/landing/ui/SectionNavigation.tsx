import { LuChevronUp } from 'react-icons/lu'
import { landingSections, type LandingSectionId } from '../model/landingSections'
import { useSectionMenu } from '../model/useSectionMenu'
import './sectionNavigation.css'

interface SectionNavigationProps {
  activeSection: LandingSectionId
}

/** 현재 구간을 표시하는 데스크톱 레일과 모바일 펼침 메뉴입니다. */
export const SectionNavigation = ({ activeSection }: SectionNavigationProps) => {
  const { isOpen, toggleRef, handleKeyDown, toggle, close } = useSectionMenu()
  const activeIndex = landingSections.findIndex((section) => section.id === activeSection)
  return (
    <nav
      className="brand-section-nav"
      aria-label="페이지 구간"
      data-open={isOpen}
      onKeyDown={handleKeyDown}
    >
      <div className="brand-section-list" id="landing-section-list">
        {landingSections.map((section, index) => (
          <a
            href={`#${section.id}`}
            key={section.id}
            aria-label={section.label}
            aria-current={activeSection === section.id ? 'location' : undefined}
            onClick={close}
          >
            <span className="brand-section-label">{section.label}</span>
            <span className="brand-section-dot" aria-hidden="true" />
            <span className="brand-section-index" aria-hidden="true">
              0{index + 1}
            </span>
          </a>
        ))}
      </div>
      <button
        className="brand-section-toggle"
        ref={toggleRef}
        type="button"
        aria-label={`구간 이동 메뉴, 현재 ${landingSections[activeIndex].label}`}
        aria-expanded={isOpen}
        aria-controls="landing-section-list"
        onClick={toggle}
      >
        <span className="brand-section-current-dot" aria-hidden="true" />
        <span aria-hidden="true">
          0{activeIndex + 1} / {String(landingSections.length).padStart(2, '0')}
        </span>
        <LuChevronUp aria-hidden="true" />
      </button>
    </nav>
  )
}
