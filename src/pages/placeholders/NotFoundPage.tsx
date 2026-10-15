import { Link } from 'react-router-dom'
import { routePaths } from '@shared/config'
import { useTranslation } from '@shared/lib'

/** 서버 인증을 통과한 사용자에게 잘못된 주소와 서비스 복귀 경로를 안내합니다. */
export const NotFoundPage = () => {
  const { t } = useTranslation()
  return (
    <main className="gap-5 p-6 flex min-h-screen flex-col items-center justify-center bg-background-alternative text-center">
      <h1 className="text-title1 font-bold text-label-normal">{t('페이지를 찾을 수 없습니다.')}</h1>
      <p className="text-body text-label-alternative">
        {t('주소를 확인하거나 대시보드로 돌아가 주세요.')}
      </p>
      <Link
        className="px-5 py-3 rounded-control bg-primary-normal text-body font-bold text-label-button-text"
        to={routePaths.dashboard}
      >
        {t('대시보드로 이동')}
      </Link>
    </main>
  )
}
