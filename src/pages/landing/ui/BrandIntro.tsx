import type { AnimationEventHandler } from 'react'
import logo from '@shared/assets/auth/logo.svg'
import './landingMotion.css'

interface BrandIntroProps {
  onEnd: AnimationEventHandler<HTMLDivElement>
}

/** 두 글자 확대 후 초록 화면을 유지하고 커튼처럼 걷어 첫 화면을 보여줍니다. */
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
