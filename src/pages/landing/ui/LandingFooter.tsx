import { Link } from 'react-router-dom'
import { LuArrowUpRight, LuGithub, LuInstagram, LuMail } from 'react-icons/lu'
import logo from '@shared/assets/auth/logo.svg'
import { routePaths } from '@shared/config'
import { landingLinks } from '../model/landingLinks'
import { WebStartLink } from './WebStartLink'

/** 서비스·공식 채널·공개 정책과 운영팀 연락처를 한곳에 제공합니다. */
export const LandingFooter = () => (
  <footer className="brand-footer px-6 lg:px-12 border-t border-line-alternative bg-background-normal">
    <div className="brand-footer-masthead" aria-hidden="true">
      <span data-footer-wordmark>
        BADA<span>®</span>
      </span>
    </div>
    <div className="max-w-6xl py-12 mx-auto">
      <div className="gap-10 sm:grid-cols-2 lg:grid-cols-4 grid">
        <div>
          <Link to={routePaths.landing} aria-label="BADA 홈">
            <img src={logo} alt="BADA" className="h-8 w-auto" />
          </Link>
          <p className="mt-5 leading-relaxed text-label text-label-alternative">
            전화가 편해지는 연습.
            <br />
            작은 용기를 일상의 자신감으로.
          </p>
        </div>
        <nav aria-label="서비스 바로가기">
          <h2 className="text-label font-bold">서비스</h2>
          <div className="mt-4 gap-1 flex flex-col items-start text-label text-label-alternative">
            <a href="#experience" className="py-2">
              BADA 둘러보기
            </a>
            <a href="#warmup" className="py-2">
              통화 전 워밍업
            </a>
            <a href="#download" className="py-2">
              앱 다운로드
            </a>
            <WebStartLink className="mt-3">웹에서 시작하기</WebStartLink>
          </div>
        </nav>
        <nav aria-label="BADA 공식 채널">
          <h2 className="text-label font-bold">BADA와 연결하기</h2>
          <div className="mt-4 gap-1 flex flex-col items-start text-label text-label-alternative">
            <a
              href={landingLinks.github}
              target="_blank"
              rel="noopener noreferrer"
              className="gap-2 py-2 flex items-center"
            >
              {' '}
              <LuGithub aria-hidden="true" />
              GitHub
              <LuArrowUpRight className="size-3" aria-label="새 탭" />
            </a>
            <a
              href={landingLinks.instagram}
              target="_blank"
              rel="noopener noreferrer"
              className="gap-2 py-2 flex items-center"
            >
              <LuInstagram aria-hidden="true" />
              Instagram
              <LuArrowUpRight className="size-3" aria-label="새 탭" />
            </a>
            <a href={landingLinks.support} className="gap-2 py-2 flex items-center">
              <LuMail aria-hidden="true" />
              서비스 문의
            </a>
          </div>
        </nav>
        <nav aria-label="이용 안내">
          <h2 className="text-label font-bold">이용 안내</h2>
          <div className="mt-4 gap-1 flex flex-col items-start text-label text-label-alternative">
            <Link to={routePaths.terms} className="py-2">
              서비스 이용약관
            </Link>
            <Link to={routePaths.privacy} className="py-2 font-bold text-label-normal">
              개인정보처리방침
            </Link>
            <Link to={routePaths.sensitiveInformation} className="py-2">
              민감정보 처리 안내
            </Link>
            <a href="#faq" className="py-2">
              자주 묻는 질문
            </a>
          </div>
        </nav>
      </div>
      <div className="mt-10 gap-6 pt-7 leading-relaxed flex flex-wrap items-end justify-between border-t border-line-neutral text-caption text-label-alternative">
        <div>
          <p>운영팀: 치킨마요덮밥 · 대표: 이도연</p>
          <a className="mt-1 inline-block break-all" href={landingLinks.support}>
            서비스 문의: team.bada.service@gmail.com
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
