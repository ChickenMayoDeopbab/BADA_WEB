import type { ReactNode } from 'react'
import type { UseQueryResult } from '@tanstack/react-query'
import type {
  DashboardCondition,
  DashboardConditionCount,
  DashboardMetricComparison,
  DashboardMetricValue,
  DashboardMetricValues,
  DashboardSeriesPoint,
  DashboardSummary,
} from '@entities/dashboard'
import { formatDuration } from '@shared/lib'
import { LoadingRegion, Skeleton, StatusState } from '@shared/ui'
import {
  dashboardMetrics,
  dashboardStatusLabels,
  formatDashboardCondition,
  formatDashboardExclusions,
  formatDashboardValue,
} from '../model/presentation'

export const analyticsButtonClass =
  'rounded-control bg-fill-neutral px-4 py-2 text-label font-medium text-label-normal hover:bg-fill-pressed disabled:opacity-50'
export const analyticsCardClass = 'min-w-0 rounded-card bg-fill-normal p-5'

/** 통계 요청별 로딩과 재시도 UI를 독립적으로 표시합니다. */
export const AnalyticsQueryState = <T,>({
  query,
  label,
  children,
}: {
  query: UseQueryResult<T, Error>
  label: string
  children: (data: T) => ReactNode
}) => {
  if (query.isPending)
    return (
      <LoadingRegion label={`${label} 불러오는 중`}>
        <Skeleton className="h-40 w-full" />
      </LoadingRegion>
    )
  if (query.isError)
    return (
      <StatusState
        isError
        title={`${label} 불러오지 못했어요`}
        onRetry={() => void query.refetch()}
        isRetrying={query.isFetching}
      />
    )
  return <>{children(query.data)}</>
}

/** 훈련 횟수와 시간 등의 서버 집계 값을 표시합니다. */
export const AnalyticsSummary = ({ summary }: { summary: DashboardSummary }) => (
  <dl className="gap-3 xl:grid-cols-4 grid grid-cols-2">
    {[
      ['훈련 횟수', `${summary.trainingCount}회`],
      ['훈련한 날짜', `${summary.trainingDays}일`],
      ['총 통화 시간', formatDuration(summary.totalDurationSeconds)],
      ['워밍업', `${summary.warmupCount}회`],
    ].map(([label, value]) => (
      <div key={label} className={analyticsCardClass}>
        <dt className="text-label text-label-alternative">{label}</dt>
        <dd className="mt-2 text-headline1 font-bold break-words text-label-normal">{value}</dd>
      </div>
    ))}
  </dl>
)

/** 미측정과 표본 부족을 숨기지 않고 표본과 제외 사유를 표시합니다. */
export const AnalyticsMetricSample = ({ metric }: { metric: DashboardMetricValue }) => (
  <div className="mt-2 space-y-1 text-caption text-label-alternative">
    <p>
      {dashboardStatusLabels[metric.status]} · 표본 {metric.sampleCount}건 · 측정 가능 발화{' '}
      {metric.eligibleTurnCount}개
    </p>
    {formatDashboardExclusions(metric) && <p>제외: {formatDashboardExclusions(metric)}</p>}
  </div>
)

/** 각 지표의 평균과 집계에 사용된 표본 정보를 표시합니다. */
export const AnalyticsMetricCards = ({ metrics }: { metrics: DashboardMetricValues }) => (
  <div className="gap-3 md:grid-cols-2 xl:grid-cols-3 grid">
    {dashboardMetrics.map(({ key, label, description }) => {
      const metric = metrics[key]
      if (!metric) return null
      return (
        <article key={key} className={analyticsCardClass}>
          <h4 className="text-body font-bold text-label-normal">{label}</h4>
          <p className="mt-1 text-caption text-label-alternative">{description}</p>
          <p className="mt-3 text-title2 font-bold text-label-normal">
            {formatDashboardValue(metric.value, metric.unit)}
          </p>
          <AnalyticsMetricSample metric={metric} />
        </article>
      )
    })}
  </div>
)

/** 서로 단위가 다른 지표를 같은 축에 합치지 않고 구간별 수치로 표시합니다. */
export const AnalyticsSeries = ({
  series,
  onSelectPeriod,
}: {
  series: DashboardSeriesPoint[]
  onSelectPeriod: (from: string, to: string) => void
}) => (
  <div className="overflow-x-auto rounded-component border border-line-alternative">
    <table className="w-full text-left text-label text-label-neutral">
      <caption className="p-3 text-left text-caption text-label-alternative">
        일별·주별 지표 추이 · 기간을 누르면 관련 기록을 볼 수 있어요. 부분 구간은 집계 중이거나 한
        주의 일부예요.
      </caption>
      <thead className="bg-fill-field">
        <tr>
          <th scope="col" className="p-3 whitespace-nowrap">
            기간
          </th>
          <th scope="col" className="p-3 whitespace-nowrap">
            훈련
          </th>
          {dashboardMetrics.map(({ key, label }) => (
            <th key={key} scope="col" className="p-3 whitespace-nowrap">
              {label}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {series.map((point) => (
          <tr key={point.from} className="border-t border-line-alternative">
            <th scope="row" className="p-3 font-medium">
              <button
                type="button"
                onClick={() => onSelectPeriod(point.from, point.to)}
                className="whitespace-nowrap text-label-normal underline underline-offset-4"
              >
                {point.from}
                {point.from !== point.to && ` ~ ${point.to}`}
                {point.isPartial && ' (부분 구간)'}
              </button>
            </th>
            <td className="p-3">{point.trainingCount}회</td>
            {dashboardMetrics.map(({ key }) => {
              const metric = point.metrics[key]
              return (
                <td
                  key={key}
                  className="p-3 whitespace-nowrap"
                  title={
                    metric
                      ? `${dashboardStatusLabels[metric.status]} · 표본 ${metric.sampleCount}건`
                      : undefined
                  }
                >
                  {metric ? formatDashboardValue(metric.value, metric.unit) : '—'}
                </td>
              )
            })}
          </tr>
        ))}
      </tbody>
    </table>
  </div>
)

/** 전체와 동일 조건 비교의 값, 변화량, 표본 정보를 표시합니다. */
export const AnalyticsComparisonMetrics = ({
  metrics,
  mode,
}: {
  metrics: DashboardMetricComparison[]
  mode: 'overall' | 'matched'
}) => (
  <div className="gap-3 md:grid-cols-2 grid">
    {metrics.map((metric) => {
      const comparison = metric[mode]
      return (
        <article key={metric.key} className={analyticsCardClass}>
          <h4 className="text-body font-bold text-label-normal">
            {dashboardMetrics.find(({ key }) => key === metric.key)?.label ?? metric.key}
          </h4>
          <dl className="mt-3 gap-2 grid grid-cols-3 text-label text-label-neutral">
            <div>
              <dt>이전 평균</dt>
              <dd className="mt-1 font-bold">
                {formatDashboardValue(comparison.baseline.value, metric.unit)}
              </dd>
            </div>
            <div>
              <dt>현재 평균</dt>
              <dd className="mt-1 font-bold">
                {formatDashboardValue(comparison.current.value, metric.unit)}
              </dd>
            </div>
            <div>
              <dt>변화량</dt>
              <dd className="mt-1 font-bold">
                {comparison.status === 'READY' && comparison.delta !== null
                  ? `${comparison.delta > 0 ? '+' : ''}${formatDashboardValue(comparison.delta, metric.deltaUnit)}`
                  : '—'}
              </dd>
            </div>
          </dl>
          <p className="mt-3 text-label text-label-alternative">
            {dashboardStatusLabels[comparison.status]}
            {mode === 'matched' && ` · 공통 조건 ${metric.matched.conditionCount}개`}
          </p>
          <details className="mt-2 text-label text-label-neutral">
            <summary className="cursor-pointer">표본 수·제외 사유</summary>
            <p className="mt-2 text-caption">이전 기간</p>
            <AnalyticsMetricSample metric={comparison.baseline} />
            <p className="mt-2 text-caption">현재 기간</p>
            <AnalyticsMetricSample metric={comparison.current} />
            {mode === 'matched' &&
              metric.matched.conditions.map((item, index) => (
                <p key={index} className="mt-2 text-caption">
                  {formatDashboardCondition(item.condition)} · 이전 {item.baselineSampleCount}건 /
                  현재 {item.currentSampleCount}건 · 가중치 {item.weight}
                </p>
              ))}
          </details>
        </article>
      )
    })}
  </div>
)

/** 훈련 조건별 분포를 표시하고 같은 조건의 기록 검색으로 연결합니다. */
export const AnalyticsConditions = ({
  conditions,
  onSelect,
}: {
  conditions: DashboardConditionCount[]
  onSelect: (condition: DashboardCondition) => void
}) => (
  <ul className="divide-y divide-line-alternative text-label text-label-neutral">
    {conditions.map(({ condition, trainingCount }, index) => (
      <li key={index}>
        <button
          type="button"
          onClick={() => onSelect(condition)}
          className="gap-3 py-3 flex w-full items-center justify-between rounded-control text-left hover:bg-fill-pressed"
        >
          <span className="break-words">{formatDashboardCondition(condition)}</span>
          <span className="shrink-0">{trainingCount}회 →</span>
        </button>
      </li>
    ))}
  </ul>
)

/** 서버 페이지 경계에서 이전·다음 이동을 제한합니다. */
export const AnalyticsPagination = ({
  page,
  totalPages,
  onChange,
  label,
}: {
  page: number
  totalPages: number
  onChange: (page: number) => void
  label: string
}) =>
  totalPages > 1 ? (
    <nav
      aria-label={label}
      className="mt-4 gap-3 flex items-center justify-center text-label text-label-neutral"
    >
      <button
        type="button"
        className={analyticsButtonClass}
        disabled={page <= 0}
        onClick={() => onChange(page - 1)}
      >
        이전
      </button>
      <span>
        {page + 1} / {totalPages}
      </span>
      <button
        type="button"
        className={analyticsButtonClass}
        disabled={page + 1 >= totalPages}
        onClick={() => onChange(page + 1)}
      >
        다음
      </button>
    </nav>
  ) : null
