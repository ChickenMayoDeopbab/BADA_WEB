import { FaApple } from 'react-icons/fa'
import { LuArrowUpRight } from 'react-icons/lu'
import oneStoreLogo from '@shared/assets/landing/onestore.png'
import { landingLinks } from '../model/landingLinks'

const stores = [
  { name: 'App Store', description: 'iPhone', url: landingLinks.appStore },
  { name: 'ONE store', description: 'Android', url: landingLinks.oneStore },
]

/** 확인된 공식 로고와 두 스토어로 이어지는 다운로드 동선입니다. */
export const AppDownload = () => (
  <section id="download" className="brand-download" aria-labelledby="download-title">
    <div className="brand-download-inner">
      <h2 id="download-title">앱으로 시작해보기</h2>
      <div className="brand-store-links">
        {stores.map(({ name, description, url }) => (
          <a
            key={name}
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`${name}에서 BADA 다운로드 (새 탭)`}
          >
            {name === 'ONE store' ? (
              <img className="brand-store-logo" src={oneStoreLogo} alt="" width="36" height="36" />
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
  </section>
)
