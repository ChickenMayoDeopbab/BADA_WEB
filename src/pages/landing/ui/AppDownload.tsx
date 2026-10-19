import { FaApple } from 'react-icons/fa'
import { LuArrowUpRight, LuShoppingBag } from 'react-icons/lu'
import { landingLinks } from '../model/landingLinks'

const stores = [
  { name: 'App Store', description: 'iPhone', icon: FaApple, url: landingLinks.appStore },
  { name: 'ONE store', description: 'Android', icon: LuShoppingBag, url: landingLinks.oneStore },
]

/** 브랜드의 마지막 문장과 검증된 스토어 동선을 하나의 펼쳐진 면으로 구성합니다. */
export const AppDownload = () => (
  <section id="download" className="brand-download" aria-labelledby="download-title">
    <div className="brand-download-top">
      <p className="brand-kicker">READY WHEN YOU ARE.</p>
      <span>당신의 첫마디를 기다릴게요.</span>
    </div>
    <h2 id="download-title">
      앱으로
      <br />
      <span>
        시작해보기
        <LuArrowUpRight aria-hidden="true" />
      </span>
    </h2>
    <div className="brand-store-links">
      {stores.map(({ name, description, icon: Icon, url }) => {
        const content = (
          <>
            <Icon aria-hidden="true" />
            <span>
              <small>{description}</small>
              <strong>{name}</strong>
              {!url && <small className="brand-store-pending">다운로드 링크 확인 중</small>}
            </span>
            {url ? (
              <>
                <span className="brand-store-status">다운로드</span>
                <LuArrowUpRight aria-hidden="true" />
              </>
            ) : (
              <span className="brand-store-dash" aria-hidden="true">
                —
              </span>
            )}
          </>
        )
        return url ? (
          <a
            key={name}
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`${name}에서 BADA 다운로드 (새 탭)`}
          >
            {content}
          </a>
        ) : (
          <button key={name} type="button" disabled aria-label={`${name} 다운로드 링크 확인 중`}>
            {content}
          </button>
        )
      })}
    </div>
  </section>
)
