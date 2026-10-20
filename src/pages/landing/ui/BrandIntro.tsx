import type { AnimationEventHandler } from 'react'
import logo from '@shared/assets/auth/logo.svg'
import './landingMotion.css'

interface BrandIntroProps {
  onEnd: AnimationEventHandler<HTMLDivElement>
}

/** 원본 로고의 두 글자를 차례로 올린 뒤 화면 전체로 확대합니다. */
export const BrandIntro = ({ onEnd }: BrandIntroProps) => (
  <div className="brand-intro" data-brand-intro aria-hidden="true" onAnimationEnd={onEnd}>
    <div className="brand-intro-logo">
      <span className="brand-intro-letter">
        <img src={logo} alt="" draggable={false} />
      </span>
      <span className="brand-intro-letter">
        <img src={logo} alt="" draggable={false} />
      </span>
    </div>
  </div>
)
