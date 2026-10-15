import { startOAuthLogin } from '../model/useOAuthLogin'
import type { OAuthProvider } from '../model/types'
import { AuthCard } from './AuthCard'
import { AuthLayout } from './AuthLayout'
import appleIcon from '@shared/assets/auth/apple.svg'
import googleIcon from '@shared/assets/auth/google.svg'
import naverIcon from '@shared/assets/auth/naver.svg'

type SocialLoginProps = {
  onSelectIdLogin: () => void
}

const socialProviders: {
  provider: OAuthProvider
  label: string
  icon: string
  className: string
}[] = [
  {
    provider: 'google',
    label: '구글로 계속할래요',
    icon: googleIcon,
    className: 'bg-neutral-95 text-neutral-5',
  },
  {
    provider: 'naver',
    // 네이버 브랜드 가이드 색상은 디자인 시스템 토큰에 없어 그대로 사용합니다.
    label: '네이버로 계속할래요',
    icon: naverIcon,
    className: 'bg-[#03cf5d] text-neutral-97',
  },
  {
    provider: 'apple',
    label: 'Apple로 계속할래요',
    icon: appleIcon,
    className: 'bg-neutral-5 text-neutral-97',
  },
]

const socialButtonClassName =
  'flex h-[51px] w-full items-center justify-center gap-2.5 rounded-component p-3.5'

// 전역 스타일의 button { font: inherit }가 유틸리티보다 우선하므로 글자 스타일은 라벨에 적용합니다.
const socialLabelClassName = 'text-headline2 font-bold'

// 소셜 로그인 제공자와 아이디 로그인 진입 버튼을 보여줍니다.
export const SocialLogin = ({ onSelectIdLogin }: SocialLoginProps) => {
  return (
    <AuthLayout>
      <AuthCard
        variant="social"
        title={'간편 로그인'}
        description={'원하는 계정으로 빠르게 시작하세요.'}
      >
        <div className="gap-3 flex w-full flex-col">
          {socialProviders.map(({ provider, label, icon, className }) => (
            <button
              key={provider}
              type="button"
              onClick={() => startOAuthLogin(provider)}
              className={`${socialButtonClassName} ${className}`}
            >
              <img src={icon} alt="" />
              <span className={socialLabelClassName}>{label}</span>
            </button>
          ))}
          <button
            type="button"
            onClick={onSelectIdLogin}
            className={`${socialButtonClassName} bg-fill-normal text-label-normal`}
          >
            <span className={socialLabelClassName}>{'아이디로 계속할래요'}</span>
          </button>
        </div>
      </AuthCard>
    </AuthLayout>
  )
}
