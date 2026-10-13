import { PromoCard, promoActionClassName } from './PromoCard'
import { useScenarioRecommendation } from '@entities/scenario'
import { routePaths } from '@shared/config'
import { generatePath, Link } from 'react-router-dom'

const recommendGradientClassName =
  'bg-linear-to-r from-dashboard-recommend-gradient-start to-dashboard-recommend-gradient-end'

// 오늘의 추천 시나리오 카드를 표시합니다. 추천을 받지 못하면 시나리오 목록으로 안내합니다.
const RecommendedScenarioCard = () => {
  const { data: scenario, isPending } = useScenarioRecommendation()

  if (isPending) {
    return (
      <PromoCard
        eyebrow="추천 시나리오"
        title="추천 시나리오를 찾고 있어요"
        description="잠시만 기다려주세요"
        className={recommendGradientClassName}
        action={<span className={`${promoActionClassName} invisible`}>훈련 하러가기 →</span>}
      />
    )
  }

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
  <div className="gap-4 flex h-[148px]">
    <RecommendedScenarioCard />
    <PromoCard
      eyebrow="통화 전 워밍업"
      title="긴장 풀고 가볍게 시작하기"
      description="부담 없는 30초 통화로 몸을 풀어요"
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
