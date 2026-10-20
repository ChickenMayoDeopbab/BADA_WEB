import { DashboardDisclosure } from './DashboardDisclosure'
import type { DashboardMetricComparison as MetricComparison } from '@entities/dashboard'
import { weeklyMetrics } from '../model/buildWeeklyMetricDays'
import {
  formatDashboardMetricValue,
  formatDashboardPeriod,
  getDashboardComparisonMessage,
  getDashboardMetricChange,
} from '../model/dashboardMetricPresentation'
import { formatDashboardExclusions } from '../model/dashboardDetails'
import type { DashboardDetailsModel } from '../model/useDashboardDetails'

/** 평균의 출처를 훈련 횟수와 읽을 수 있는 제외 사유로 설명합니다. */
const MetricCalculationDetails = ({
  metric,
  mode,
}: {
  metric: MetricComparison
  mode: 'overall' | 'matched'
}) => {
  const comparison = metric[mode]
  return (
    <DashboardDisclosure title="평균을 어떻게 계산하나요?">
      <div className="space-y-3 text-caption text-label-alternative">
        <p>선택한 지표를 측정할 수 있었던 훈련만 평균 계산에 사용해요.</p>
        {(
          [
            ['이전 기간', comparison.baseline],
            ['현재 기간', comparison.current],
          ] as const
        ).map(([label, value]) => (
          <div key={label} className="space-y-1">
            <p className="font-medium text-label-normal">
              {label} · 계산에 사용한 훈련 {value.sampleCount}회
            </p>
            {metric.key !== 'selfReportedAnxiety' && (
              <p>분석할 수 있었던 발화 {value.eligibleTurnCount}개</p>
            )}
            {formatDashboardExclusions(value.exclusionReasons) && (
              <p>계산에서 빠진 이유: {formatDashboardExclusions(value.exclusionReasons)}</p>
            )}
          </div>
        ))}
        {mode === 'matched' && (
          <p>두 기간에 공통으로 있는 설정 {metric.matched.conditionCount}가지로 비교했어요.</p>
        )}
      </div>
    </DashboardDisclosure>
  )
}

/** 선택한 한 지표의 이전·현재 평균과 변화만 표시합니다. */
export const DashboardMetricComparison = ({
  metric,
  model,
  periods,
}: {
  metric: MetricComparison | undefined
  model: DashboardDetailsModel
  periods: {
    baseline: { from: string; to: string } | null
    current: { from: string; to: string }
  }
}) => {
  if (!metric)
    return <p className="text-label text-label-alternative">이 지표의 비교 기록이 없어요.</p>
  const definition = weeklyMetrics.find(({ key }) => key === metric.key)!
  const comparison = metric[model.mode]
  const message = getDashboardComparisonMessage(comparison)
  const change = getDashboardMetricChange(metric, model.mode)
  return (
    <section aria-label={`${definition.label} 비교`} className="space-y-4">
      <div className="space-y-5 p-5 rounded-card bg-fill-normal">
        <div className="space-y-1">
          <h3 className="text-headline2 font-bold text-label-normal">{definition.label}</h3>
          <p className="text-caption text-label-alternative">{definition.description}</p>
        </div>
        <dl className="gap-4 grid grid-cols-2">
          {(
            [
              ['이전 평균', comparison.baseline, periods.baseline],
              ['현재 평균', comparison.current, periods.current],
            ] as const
          ).map(([label, value, period]) => (
            <div key={label} className="min-w-0 space-y-1">
              <dt className="text-label text-label-alternative">{label}</dt>
              <dd className="text-title1 font-bold break-words text-label-normal">
                {formatDashboardMetricValue(value, definition.unit)}
              </dd>
              {period && (
                <p className="text-caption text-label-alternative">
                  {formatDashboardPeriod(period)}
                </p>
              )}
            </div>
          ))}
        </dl>
        <div className="pt-4 border-t border-line-alternative">
          <p
            className={`${message ? 'text-label text-label-alternative' : 'text-body font-bold text-label-normal'}`}
          >
            {message ?? change}
          </p>
          {comparison.status === 'READY' && metric.deltaUnit === 'PERCENTAGE_POINT' && (
            <p className="mt-1 text-caption text-label-alternative">
              %p는 두 비율의 차이예요. 예: 20% → 10%는 10%p 감소
            </p>
          )}
        </div>
      </div>
      <DashboardDisclosure
        title={`비교 방식 · ${model.mode === 'overall' ? '모든 훈련' : '같은 상황과 설정'}`}
      >
        <div className="space-y-3">
          <p className="text-caption text-label-alternative">
            기본은 두 기간의 모든 훈련을 비교해요. 아래 항목을 켜면 상황·난이도·상대 말투·힌트 등이
            같은 훈련끼리 비교해요.
          </p>
          <label className="gap-2 flex cursor-pointer items-start text-label text-label-normal">
            <input
              type="checkbox"
              checked={model.mode === 'matched'}
              onChange={(event) => model.setMode(event.target.checked ? 'matched' : 'overall')}
              className="mt-0.5 size-4 shrink-0 accent-primary-normal"
            />
            같은 상황과 설정으로 한 훈련만 비교
          </label>
        </div>
      </DashboardDisclosure>
      <MetricCalculationDetails
        key={`${metric.key}-${model.mode}`}
        metric={metric}
        mode={model.mode}
      />
    </section>
  )
}
