import { routePaths } from '@shared/config'
import { ErrorScreen } from '@shared/ui'

/** 렌더링 오류를 숨기고 문서를 다시 로드하거나 안전한 첫 화면으로 복구합니다. */
export const RouteErrorPage = () => (
  <ErrorScreen
    variant="error"
    title="화면을 불러오지 못했어요."
    description="잠시 연결이 끊긴 것 같아요. 다시 시도하거나 홈으로 돌아가 주세요."
    actions={
      <>
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="px-6 py-3 rounded-control bg-primary-normal text-body font-bold text-label-normal transition-opacity hover:opacity-80"
        >
          다시 시도하기
        </button>
        <a
          href={routePaths.landing}
          className="px-6 py-3 rounded-control border border-line-neutral text-body font-medium text-label-normal transition-colors hover:bg-fill-normal"
        >
          홈으로 돌아가기
        </a>
      </>
    }
  />
)
