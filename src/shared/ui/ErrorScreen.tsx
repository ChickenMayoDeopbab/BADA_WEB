import type { ReactNode } from 'react'
import { IoCallOutline } from 'react-icons/io5'

interface ErrorScreenProps {
  variant: 'not-found' | 'error'
  title: string
  description: string
  actions: ReactNode
  illustration?: ReactNode
}

/** BADA의 전화 모티프와 섬을 그립니다. 최종 이미지가 준비되면 illustration으로 교체할 수 있습니다. */
const ErrorIllustration = ({ variant }: Pick<ErrorScreenProps, 'variant'>) => (
  <svg viewBox="0 0 640 300" fill="none" className="w-full" aria-hidden="true">
    <ellipse cx="320" cy="258" rx="228" ry="22" className="fill-primary-alternative" />
    <path
      d="M126 248C175 225 218 234 260 244C306 255 353 219 400 229C449 240 486 232 514 249"
      className="stroke-primary-normal"
      strokeWidth="2"
      strokeLinecap="round"
    />
    <path
      d="M158 272H218M418 274H466M288 283H350"
      className="stroke-line-neutral"
      strokeWidth="2"
      strokeLinecap="round"
    />
    <path
      d="M93 96H149M478 80H536M512 106H550"
      className="stroke-fill-neutral"
      strokeWidth="12"
      strokeLinecap="round"
    />
    <path
      d="M180 54V66M174 60H186M464 178V190M458 184H470"
      className="stroke-primary-normal"
      strokeWidth="2"
      strokeLinecap="round"
    />
    <circle cx="438" cy="44" r="4" className="fill-primary-normal" />
    <circle cx="130" cy="196" r="3" className="fill-line-normal" />
    {variant === 'not-found' ? (
      <g
        className="stroke-label-normal"
        strokeWidth="14"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M202 100L160 175H220M207 128V211" />
        <rect x="266" y="98" width="108" height="116" rx="54" className="fill-background-normal" />
        <path d="M446 100L404 175H464M451 128V211" />
      </g>
    ) : (
      <g strokeLinecap="round" strokeLinejoin="round">
        <path
          d="M214 207C156 207 157 114 210 114H250M390 174H424C480 174 476 98 432 98"
          className="stroke-label-normal"
          strokeWidth="12"
        />
        <path
          d="M240 99L256 109M239 127L256 117M384 159L371 150M384 186L369 193"
          className="stroke-primary-normal"
          strokeWidth="4"
        />
        <circle
          cx="320"
          cy="151"
          r="62"
          className="fill-background-normal stroke-label-normal"
          strokeWidth="12"
        />
      </g>
    )}
    <circle cx="320" cy="154" r="38" className="fill-primary-alternative" />
    <IoCallOutline x="298" y="132" size={44} className="text-label-normal" />
    <path
      d="M337 128L348 117M344 141H357M323 122V110"
      className="stroke-primary-normal"
      strokeWidth="3"
      strokeLinecap="round"
    />
  </svg>
)

/** 잘못된 주소와 화면 오류에 일관된 안내·복구 동작을 표시합니다. */
export const ErrorScreen = ({
  variant,
  title,
  description,
  actions,
  illustration,
}: ErrorScreenProps) => (
  <main className="px-6 py-10 flex min-h-dvh flex-col items-center justify-center bg-background-normal text-center">
    <div className="max-w-2xl w-full">
      <div className="max-w-xl mx-auto w-full">
        {illustration ?? <ErrorIllustration variant={variant} />}
      </div>
      <p className="mt-4 tracking-widest text-caption font-bold text-label-alternative">
        {variant === 'not-found' ? '404 · PAGE NOT FOUND' : 'BADA · CONNECTION LOST'}
      </p>
      <div role={variant === 'error' ? 'alert' : undefined}>
        <h1 className="mt-4 max-sm:text-title1 text-display2 font-bold text-label-normal">
          {title}
        </h1>
        <p className="mt-4 max-w-md mx-auto text-body text-label-alternative">{description}</p>
      </div>
      <div className="mt-8 gap-3 flex flex-wrap items-center justify-center">{actions}</div>
      <p className="mt-12 text-caption text-label-alternative">전화가 편해지는 연습, BADA</p>
    </div>
  </main>
)
