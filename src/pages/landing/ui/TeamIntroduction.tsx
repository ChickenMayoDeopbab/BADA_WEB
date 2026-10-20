import { LuArrowUpRight } from 'react-icons/lu'
import logo from '@shared/assets/auth/logo.svg'
import { landingLinks } from '../model/landingLinks'
import './teamIntroduction.css'

/** 서비스 이야기와 브랜드·공식 채널을 표시합니다. */
export const TeamIntroduction = () => (
  <section id="team" className="brand-team" aria-labelledby="team-title">
    <div className="brand-team-inner">
      <h2 id="team-title">
        편하게 말할 수 있는
        <br />
        내일을 만듭니다.
      </h2>
      <div className="brand-team-story" data-team-story>
        <div className="brand-team-signature">
          <img src={logo} alt="BADA" width="300" height="132" draggable={false} />
        </div>
        <div className="brand-team-description">
          <p>
            전화 한 통이 부담스러운 순간에도,
            <br />
            나만의 속도로 시작할 수 있도록.
          </p>
          <p>
            상황을 고르고, AI와 대화하고, 내 말을 돌아보는 경험. BADA는 일상 속 통화를 미리 연습할
            수 있는 공간을 만듭니다.
          </p>
          <nav className="brand-team-links" aria-label="만드는 팀 알아보기">
            <a href={landingLinks.github} target="_blank" rel="noopener noreferrer">
              팀 GitHub <LuArrowUpRight aria-hidden="true" />
            </a>
            <a href={landingLinks.instagram} target="_blank" rel="noopener noreferrer">
              Instagram <LuArrowUpRight aria-hidden="true" />
            </a>
          </nav>
        </div>
      </div>
    </div>
  </section>
)
