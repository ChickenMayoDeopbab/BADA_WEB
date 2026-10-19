import { FaApple } from 'react-icons/fa'
import { LuArrowUpRight, LuShoppingBag, LuSmartphone } from 'react-icons/lu'
import appLogo from '@shared/assets/badaLogo.svg'
import { landingLinks } from '../model/landingLinks'

const stores = [
  {
    name: 'App Store',
    description: 'iPhone에서 시작하기',
    icon: FaApple,
    url: landingLinks.appStore,
  },
  {
    name: 'ONE store',
    description: 'Android에서 시작하기',
    icon: LuShoppingBag,
    url: landingLinks.oneStore,
  },
]

/** 확인된 다운로드 주소만 연결하고 미확인 주소는 명시적인 비활성 상태로 표시합니다. */
export const AppDownload = () => (
  <section
    id="download"
    aria-labelledby="download-title"
    className="scroll-mt-28 px-6 pb-20 lg:px-10"
  >
    <div className="max-w-6xl gap-10 p-7 sm:p-12 lg:grid-cols-2 lg:p-16 mx-auto grid items-center overflow-hidden rounded-dialog bg-secondary-normal">
      <div>
        <p className="gap-2 flex items-center text-label font-medium text-secondary-assistive">
          <LuSmartphone className="size-4" aria-hidden="true" />
          BADA IN YOUR POCKET
        </p>
        <h2
          id="download-title"
          className="mt-5 sm:text-display1 text-title1 font-bold text-label-button-text"
        >
          앱으로 시작해보기
        </h2>
        <p className="mt-5 leading-relaxed text-body text-secondary-assistive">
          책상 앞에서도, 내 손안에서도.
          <br />
          나에게 편한 곳에서 전화 연습을 이어가세요.
        </p>
        <div className="mt-8 gap-3 sm:grid-cols-2 grid">
          {stores.map(({ name, description, icon: Icon, url }) => {
            const content = (
              <>
                <Icon className="size-7 shrink-0" aria-hidden="true" />
                <span>
                  <span className="block text-caption text-label-alternative">{description}</span>
                  <span className="mt-1 block text-headline2 font-bold">{name}</span>
                  {!url && (
                    <span className="mt-1 block text-caption text-label-alternative">
                      다운로드 링크 확인 중
                    </span>
                  )}
                </span>
                {url && <LuArrowUpRight className="size-4 ml-auto shrink-0" aria-hidden="true" />}
              </>
            )
            const className =
              'flex min-h-20 items-center gap-3 rounded-component bg-background-normal p-4 text-left text-label-normal'
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
                className={`${className} cursor-not-allowed`}
                aria-label={`${name} 다운로드 링크 확인 중`}
              >
                {content}
              </button>
            )
          })}
        </div>
      </div>
      <div
        className="max-w-xs relative mx-auto flex aspect-square w-full items-center justify-center"
        aria-hidden="true"
      >
        <div className="inset-0 absolute rounded-pill border border-secondary-alternative/40" />
        <div className="inset-7 absolute rounded-pill border border-secondary-alternative/40" />
        <div className="inset-14 absolute rounded-pill bg-primary-normal/10" />
        <img
          src={appLogo}
          alt=""
          className="size-28 sm:size-36 relative -rotate-6 shadow-elevated-card"
        />
        <div className="bottom-5 right-0 px-5 py-3 absolute rounded-pill border border-secondary-alternative bg-secondary-normal text-label font-medium text-label-button-text">
          조금씩, 더 편안하게.
        </div>
      </div>
    </div>
  </section>
)
