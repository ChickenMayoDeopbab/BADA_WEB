import { Link } from 'react-router-dom'
import { routePaths } from '@shared/config'
import { ErrorScreen } from '@shared/ui'

/** 인증된 사용자가 없는 주소에 접근하면 서비스 복귀 경로를 안내합니다. */
export const NotFoundPage = () => (
  <ErrorScreen
    variant="not-found"
    title="페이지를 찾을 수 없습니다."
    description="찾으시는 페이지가 이동했거나 사라졌어요. 주소를 확인하거나 익숙한 곳에서 다시 시작해 보세요."
    actions={
      <>
        <Link
          className="px-6 py-3 rounded-control bg-primary-normal text-body font-bold text-label-normal transition-opacity hover:opacity-80"
          to={routePaths.dashboard}
        >
          대시보드로 이동
        </Link>
        <Link
          className="px-6 py-3 rounded-control border border-line-neutral text-body font-medium text-label-normal transition-colors hover:bg-fill-normal"
          to={routePaths.landing}
        >
          홈으로 돌아가기
        </Link>
      </>
    }
  />
)
