import { useTranslation } from '@shared/lib'
import { Link } from 'react-router-dom'
import { routePaths } from '@shared/config'

/** 예상하지 못한 화면 오류에서도 새로고침 또는 대시보드로 복귀할 수 있습니다. */
export const RouteErrorPage = () => {
  const { t } = useTranslation()
  return (
    <main className="gap-5 p-6 flex min-h-screen flex-col items-center justify-center bg-background-alternative text-center">
      <div role="alert">
        <h1 className="text-title1 font-bold text-label-normal">
          {t('화면을 불러오지 못했어요.')}
        </h1>
        <p className="mt-3 text-body text-label-alternative">{t('잠시 후 다시 시도해 주세요.')}</p>
      </div>
      <div className="gap-3 flex">
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="px-5 py-3 rounded-component bg-primary-normal text-body font-bold"
        >
          {t('다시 시도하기')}
        </button>
        <Link
          to={routePaths.dashboard}
          className="px-5 py-3 rounded-component bg-fill-neutral text-body text-label-normal"
        >
          {t('대시보드로 이동')}
        </Link>
      </div>
    </main>
  )
}
