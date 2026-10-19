import { FaApple } from 'react-icons/fa'
import { LuArrowUpRight, LuShoppingBag } from 'react-icons/lu'
import { landingLinks } from '../model/landingLinks'

const stores = [
  { name: 'App Store', description: 'iPhone', icon: FaApple, url: landingLinks.appStore },
  { name: 'ONE store', description: 'Android', icon: LuShoppingBag, url: landingLinks.oneStore },
]

/** 앱 이용 동선을 간결하게 안내하고 확인되지 않은 스토어 주소는 비활성 상태로 둡니다. */
export const AppDownload = () => (
  <section
    id="download"
    aria-labelledby="download-title"
    className="scroll-mt-20 px-6 py-14 sm:py-16 lg:px-12 bg-primary-normal text-secondary-normal"
  >
    <div className="max-w-6xl gap-9 lg:grid-cols-2 lg:gap-16 mx-auto grid items-center">
      <div>
        <p className="text-label font-medium">이제, 일상에서도.</p>
        <h2 id="download-title" className="mt-4 sm:text-marketing-title text-display2 font-bold">
          앱으로 시작해보기
        </h2>
        <p className="mt-5 leading-relaxed text-body">
          전화가 필요한 순간, 곁에 두세요.
          <br />
          BADA와 당신의 속도로 연습을 이어가요.
        </p>
      </div>
      <div className="gap-3 sm:grid-cols-2 grid">
        {stores.map(({ name, description, icon: Icon, url }) => {
          const content = (
            <>
              <Icon className="size-7 shrink-0" aria-hidden="true" />
              <span>
                <span className="block text-caption text-label-button-text/70">{description}</span>
                <span className="mt-1 block text-headline2 font-medium">{name}</span>
                {!url && (
                  <span className="mt-2 block text-caption text-label-button-text/70">
                    다운로드 링크 확인 중
                  </span>
                )}
              </span>
              {url && <LuArrowUpRight className="size-4 ml-auto shrink-0" aria-hidden="true" />}
            </>
          )
          const className =
            'flex min-h-24 items-center gap-4 rounded-component bg-secondary-normal p-5 text-left text-label-button-text'
          return url ? (
            <a
              key={name}
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className={`${className} hover:opacity-90`}
              aria-label={`${name}에서 BADA 다운로드 (새 탭)`}
            >
              {content}
            </a>
          ) : (
            <button
              key={name}
              type="button"
              disabled
              className={className}
              aria-label={`${name} 다운로드 링크 확인 중`}
            >
              {content}
            </button>
          )
        })}
      </div>
    </div>
  </section>
)
