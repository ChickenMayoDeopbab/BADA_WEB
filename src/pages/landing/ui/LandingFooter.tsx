import { Link } from 'react-router-dom'
import { LuGithub, LuInstagram } from 'react-icons/lu'
import logo from '@shared/assets/auth/logo.svg'
import { routePaths } from '@shared/config'
import { landingLinks } from '../model/landingLinks'

/** 공식 채널·필수 정책·운영 연락처만 간결하게 제공합니다. */
export const LandingFooter = () => (
  <footer className="brand-footer border-t border-line-alternative bg-background-normal">
    <div className="max-w-6xl py-10 mx-auto">
      <div className="gap-6 flex flex-wrap items-center justify-between">
        <Link to={routePaths.landing} aria-label="BADA 홈">
          <img src={logo} alt="BADA" className="h-8 w-auto" />
        </Link>
        <nav
          aria-label="BADA 공식 채널"
          className="gap-6 flex items-center text-label text-label-alternative"
        >
          <a
            href={landingLinks.github}
            target="_blank"
            rel="noopener noreferrer"
            className="gap-2 py-2 flex items-center"
            aria-label="GitHub (새 탭)"
          >
            <LuGithub aria-hidden="true" /> GitHub
          </a>
          <a
            href={landingLinks.instagram}
            target="_blank"
            rel="noopener noreferrer"
            className="gap-2 py-2 flex items-center"
            aria-label="Instagram (새 탭)"
          >
            <LuInstagram aria-hidden="true" /> Instagram
          </a>
        </nav>
      </div>
      <nav
        aria-label="이용 안내"
        className="mt-7 gap-x-6 gap-y-2 flex flex-wrap text-label text-label-alternative"
      >
        <Link to={routePaths.terms} className="py-2">
          서비스 이용약관
        </Link>
        <Link to={routePaths.privacy} className="py-2 font-bold text-label-normal">
          개인정보처리방침
        </Link>
        <Link to={routePaths.sensitiveInformation} className="py-2">
          민감정보 처리 안내
        </Link>
      </nav>
      <div className="mt-6 gap-6 pt-6 leading-relaxed flex flex-wrap items-end justify-between border-t border-line-neutral text-caption text-label-alternative">
        <div>
          <p>운영팀: 치킨마요덮밥 · 대표: 이도연</p>
          <a className="mt-1 inline-block break-all" href={landingLinks.support}>
            문의: team.bada.service@gmail.com
          </a>
          <p className="mt-1">
            개인정보 보호책임자: 이도연 ·{' '}
            <a href="mailto:dgsw0509@dgsw.hs.kr" className="break-all">
              dgsw0509@dgsw.hs.kr
            </a>
          </p>
        </div>
        <p>© 2026 BADA. All rights reserved.</p>
      </div>
    </div>
  </footer>
)
