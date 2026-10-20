import { FaApple } from 'react-icons/fa'
import { LuArrowUpRight } from 'react-icons/lu'
import googlePlayLogo from '@shared/assets/landing/google-play.svg'
import logo from '@shared/assets/auth/logo.svg'
import { landingLinks } from '../model/landingLinks'
import './appDownload.css'

const stores = [
  { name: 'App Store', description: 'iPhone', url: landingLinks.appStore },
  { name: 'Google Play', description: 'Android', url: landingLinks.googlePlay },
]

/** 한 화면 크기의 다운로드 무대를 잠시 고정해 공식 스토어로 안내합니다. */
export const AppDownload = () => (
  <section id="download" className="brand-download" aria-labelledby="download-title">
    <div className="brand-download-stage" data-download-stage>
      <div className="brand-download-inner">
        <div className="brand-download-heading">
          <h2 id="download-title">
            <span>앱으로</span> <span>시작해보기</span>
          </h2>
          <img
            className="brand-download-wordmark"
            src={logo}
            alt=""
            aria-hidden="true"
            draggable={false}
          />
        </div>
        <div className="brand-store-links">
          {stores.map(({ name, description, url }) => (
            <a
              key={name}
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`${name}에서 BADA 다운로드 (새 탭)`}
            >
              {name === 'Google Play' ? (
                <img
                  className="brand-store-logo"
                  src={googlePlayLogo}
                  alt=""
                  width="36"
                  height="36"
                />
              ) : (
                <FaApple className="brand-store-logo" aria-hidden="true" />
              )}
              <span>
                <small>{description}</small>
                <strong>{name}</strong>
              </span>
              <LuArrowUpRight aria-hidden="true" />
            </a>
          ))}
        </div>
      </div>
    </div>
  </section>
)
