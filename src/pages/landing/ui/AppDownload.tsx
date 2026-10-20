import appStoreBadge from '@shared/assets/landing/app-store-badge-ko.png'
import googlePlayBadge from '@shared/assets/landing/google-play-badge-ko.png'
import logo from '@shared/assets/auth/logo.svg'
import { landingLinks } from '../model/landingLinks'
import './appDownload.css'

const stores = [
  {
    name: 'App Store',
    id: 'app-store',
    url: landingLinks.appStore,
    badge: appStoreBadge,
    width: 778,
    height: 240,
  },
  {
    name: 'Google Play',
    id: 'google-play',
    url: landingLinks.googlePlay,
    badge: googlePlayBadge,
    width: 646,
    height: 250,
  },
] as const

/** 공식 한국어 스토어 배지를 원본 비율과 여백 그대로 표시합니다. */
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
          {stores.map(({ name, id, url, badge, width, height }) => (
            <a
              key={id}
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              data-store={id}
              aria-label={`${name}에서 BADA 다운로드 (새 탭)`}
            >
              <img
                className="brand-store-badge"
                src={badge}
                alt=""
                width={width}
                height={height}
                draggable={false}
              />
            </a>
          ))}
        </div>
      </div>
    </div>
  </section>
)
