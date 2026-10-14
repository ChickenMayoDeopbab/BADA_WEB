import { LoadingRegion, Skeleton } from '@shared/ui'
import { PromoCard, promoActionClassName } from './PromoCard'
import { useScenarioRecommendation } from '@entities/scenario'
import { routePaths } from '@shared/config'
import { generatePath, Link } from 'react-router-dom'

const recommendGradientClassName =
  'bg-linear-to-r from-dashboard-recommend-gradient-start to-dashboard-recommend-gradient-end'

// 오늘의 추천 시나리오 카드를 표시합니다. 추천을 받지 못하면 시나리오 목록으로 안내합니다.
const RecommendedScenarioCard = () => {
  const { data: scenario, isPending, isError, refetch, isFetching } = useScenarioRecommendation()

  if (isPending)
    return (
      <LoadingRegion
        label="추천 시나리오를 불러오는 중"
        className={`p-5 rounded-2xl min-h-[148px] flex-1 ${recommendGradientClassName}`}
      >
        <Skeleton className="h-3 w-24" />
        <Skeleton className="mt-2 h-7 w-2/3" />
        <Skeleton className="mt-2 h-4" />
        <Skeleton className="mt-3 h-8 w-36" />
      </LoadingRegion>
    )
  if (isError && !scenario)
    return (
      <PromoCard
        eyebrow="추천 시나리오"
        title="추천을 불러오지 못했어요"
        description="잠시 후 다시 시도해 주세요"
        className={recommendGradientClassName}
        action={
          <button
            type="button"
            className={promoActionClassName}
            disabled={isFetching}
            onClick={() => void refetch()}
          >
            다시 불러오기 →
          </button>
        }
      />
    )

  if (!scenario) {
    return (
      <PromoCard
        eyebrow="추천 시나리오"
        title="추천할 시나리오가 없어요"
        description="시나리오 목록에서 연습할 시나리오를 골라보세요"
        className={recommendGradientClassName}
        action={
          <Link to={routePaths.training} className={promoActionClassName}>
            <span>시나리오 보러가기</span>
            <span aria-hidden="true">→</span>
          </Link>
        }
      />
    )
  }

  return (
    <PromoCard
      eyebrow="추천 시나리오"
      title={scenario.title}
      description={scenario.content}
      className={recommendGradientClassName}
      action={
        <Link
          to={generatePath(routePaths.trainingSettings, {
            scenarioId: String(scenario.scenarioId),
          })}
          className={promoActionClassName}
        >
          <span>훈련 하러가기</span>
          <span aria-hidden="true">→</span>
        </Link>
      }
    />
  )
}

// 추천 시나리오와 통화 전 워밍업 카드를 나란히 표시합니다.
export const DashboardPromoCards = () => (
  <div className="gap-4 max-lg:h-auto max-lg:flex-col flex h-[148px]">
    <RecommendedScenarioCard />
    <PromoCard
      eyebrow="통화 전 워밍업"
      title="긴장 풀고 가볍게 시작하기"
      description="부담 없는 30초 통화로 몸을 풀어요 · 준비 중"
      className="bg-dashboard-warmup-background"
      action={
        // 워밍업 화면이 준비되기 전까지 이동 없이 버튼만 표시합니다.
        <button type="button" className={`${promoActionClassName} cursor-default`} disabled>
          <span>워밍업 하러가기</span>
          <span aria-hidden="true">→</span>
        </button>
      }
    />
  </div>
)
