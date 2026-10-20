import type { AnimationEventHandler } from 'react'
import logo from '@shared/assets/auth/logo.svg'
import './landingMotion.css'

interface BrandIntroProps {
  onEnd: AnimationEventHandler<HTMLDivElement>
}

/** 실제 로고가 화면을 채우며 사라지는 장식용 첫 방문 오프닝입니다. */
export const BrandIntro = ({ onEnd }: BrandIntroProps) => (
  <div className="brand-intro" data-brand-intro aria-hidden="true" onAnimationEnd={onEnd}>
    <img src={logo} alt="" draggable={false} />
  </div>
)
