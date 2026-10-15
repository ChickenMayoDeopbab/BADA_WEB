import { useTranslation } from '@shared/lib'
import { useOAuthCallback } from '../model/useOAuthLogin'
import { AuthButton } from './AuthButton'
import { AuthCard } from './AuthCard'
import { AuthLayout } from './AuthLayout'

// 소셜 로그인 콜백을 처리하는 동안 진행 상태나 실패 안내를 보여줍니다.
export const OAuthCallback = () => {
  const { t } = useTranslation()

  const callback = useOAuthCallback()

  if (callback.status === 'loading') {
    return (
      <AuthLayout>
        <AuthCard title={t('로그인 확인 중')} description={t('잠시만 기다려 주세요.')}>
          <div
            role="status"
            aria-label={t('로그인 확인 중')}
            className="size-8 animate-spin rounded-pill border-4 border-primary-alternative border-t-primary-normal"
          />
        </AuthCard>
      </AuthLayout>
    )
  }

  return (
    <AuthLayout>
      <AuthCard title={t('로그인 실패')} description={callback.errorMessage}>
        <AuthButton label={t('로그인 화면으로 돌아가기')} onClick={callback.goToLogin} />
      </AuthCard>
    </AuthLayout>
  )
}
