import { LuArrowUpRight } from 'react-icons/lu'
import logo from '@shared/assets/auth/logo.svg'
import { landingLinks } from '../model/landingLinks'
import './teamIntroduction.css'

/** 팀 소개를 채우기 전까지 제목·브랜드·공식 채널만 표시합니다. */
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
  </section>
)
