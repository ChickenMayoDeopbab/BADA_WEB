import type { ReactNode } from 'react'
import type { UseQueryResult } from '@tanstack/react-query'
import type {
  DashboardCondition,
  DashboardConditionCount,
  DashboardMetricComparison,
  DashboardMetricValue,
  DashboardSummary,
} from '@entities/dashboard'
import { LoadingRegion, Skeleton, StatusState } from '@shared/ui'
import { formatDuration } from '@shared/lib'
import {
  dashboardStatusLabels,
  formatDashboardCondition,
  formatDashboardDelta,
  formatDashboardExclusions,
} from '../model/dashboardDetails'
import { formatWeeklyMetric, weeklyMetrics } from '../model/buildWeeklyMetricDays'

export const detailButtonClass =
  'rounded-control bg-fill-neutral px-3 py-2 text-label font-medium text-label-normal hover:bg-fill-pressed disabled:opacity-50'
export const detailFieldClass =
  'min-w-0 w-full rounded-control border border-line-normal bg-fill-field px-3 py-2 text-label text-label-normal'

/** 패널 내부의 조회 오류가 나머지 영역을 가리지 않도록 독립적으로 표시합니다. */
export const DetailQueryState = <T,>({
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

/** 기간별 훈련량을 같은 항목과 단위로 표시합니다. */
export const DetailSummary = ({ summary }: { summary: DashboardSummary }) => (
  <dl className="mt-3 gap-3 grid grid-cols-2 text-label text-label-alternative">
    {[
      ['훈련', `${summary.trainingCount}회`],
      ['훈련한 날짜', `${summary.trainingDays}일`],
      ['통화 시간', formatDuration(summary.totalDurationSeconds)],
      ['워밍업', `${summary.warmupCount}회`],
    ].map(([label, value]) => (
      <div key={label}>
        <dt>{label}</dt>
        <dd className="mt-1 font-bold text-label-normal">{value}</dd>
      </div>
    ))}
  </dl>
)

/** 비교 표본과 제외 사유를 서버의 값 그대로 표시합니다. */
const DetailSample = ({ label, metric }: { label: string; metric: DashboardMetricValue }) => (
  <div className="mt-2 text-caption text-label-alternative">
    <p>
      {label} 표본 {metric.sampleCount}건 · 측정 가능 발화 {metric.eligibleTurnCount}개
    </p>
    {formatDashboardExclusions(metric.exclusionReasons) && (
      <p className="mt-1">제외: {formatDashboardExclusions(metric.exclusionReasons)}</p>
    )}
  </div>
)

/** 전체 비교와 동일 조건 비교를 전환하는 버튼을 표시합니다. */
export const DetailComparisonMode = ({
  mode,
  onChange,
}: {
  mode: 'overall' | 'matched'
  onChange: (mode: 'overall' | 'matched') => void
}) => (
  <div role="group" aria-label="비교 방식" className="gap-2 flex flex-wrap">
    {(['overall', 'matched'] as const).map((value) => (
      <button
        key={value}
        type="button"
        aria-pressed={mode === value}
        onClick={() => onChange(value)}
        className={`${detailButtonClass} ${mode === value ? 'bg-primary-alternative' : ''}`}
      >
        {value === 'overall' ? '전체 비교' : '동일 조건 비교'}
      </button>
    ))}
  </div>
)

/** 점수·비율·시간을 각 단위로 비교하고 계산 불가 상태를 구분합니다. */
export const DetailComparisonMetrics = ({
  metrics,
  mode,
}: {
  metrics: DashboardMetricComparison[]
  mode: 'overall' | 'matched'
}) => (
  <div className="space-y-3">
    {metrics.map((metric) => {
      const comparison = metric[mode]
      const definition = weeklyMetrics.find(({ key }) => key === metric.key)
      return (
        <article key={metric.key} className="p-4 rounded-component bg-fill-normal">
          <div className="gap-2 flex flex-wrap items-center justify-between">
            <h4 className="text-body font-bold text-label-normal">
              {definition?.label ?? metric.key}
            </h4>
            <span className="text-caption text-label-alternative">
              {dashboardStatusLabels[comparison.status]}
            </span>
          </div>
          <dl className="mt-3 gap-2 grid grid-cols-3 text-label text-label-alternative">
            <div>
              <dt>이전 평균</dt>
              <dd className="mt-1 font-bold break-words text-label-normal">
                {formatWeeklyMetric(comparison.baseline, definition?.unit ?? metric.unit)}
              </dd>
            </div>
            <div>
              <dt>현재 평균</dt>
              <dd className="mt-1 font-bold break-words text-label-normal">
                {formatWeeklyMetric(comparison.current, definition?.unit ?? metric.unit)}
              </dd>
            </div>
            <div>
              <dt>변화량</dt>
              <dd className="mt-1 font-bold break-words text-label-normal">
                {comparison.status === 'READY'
                  ? formatDashboardDelta(comparison.delta, metric.deltaUnit)
                  : '—'}
              </dd>
            </div>
          </dl>
          <details className="mt-3 text-label text-label-neutral">
            <summary className="cursor-pointer">표본 수·제외 사유</summary>
            <DetailSample label="이전" metric={comparison.baseline} />
            <DetailSample label="현재" metric={comparison.current} />
            {mode === 'matched' && (
              <>
                <p className="mt-2 text-caption text-label-alternative">
                  공통 조건 {metric.matched.conditionCount}개
                </p>
                {metric.matched.conditions.map((item, index) => (
                  <p key={index} className="mt-2 text-caption text-label-alternative">
                    {formatDashboardCondition(item.condition)} · 이전 {item.baselineSampleCount}건 /
                    현재 {item.currentSampleCount}건 · 가중치 {item.weight}
                  </p>
                ))}
              </>
            )}
          </details>
        </article>
      )
    })}
  </div>
)

/** 조건 분포를 같은 조건의 관련 기록 조회로 연결합니다. */
export const DetailConditions = ({
  items,
  onSelect,
}: {
  items: DashboardConditionCount[]
  onSelect: (condition: DashboardCondition) => void
}) => (
  <ul className="divide-y divide-line-alternative">
    {items.map(({ condition, trainingCount }, index) => (
      <li key={index}>
        <button
          type="button"
          onClick={() => onSelect(condition)}
          className="gap-3 py-3 flex w-full items-start justify-between rounded-control text-left text-label text-label-neutral hover:bg-fill-pressed"
        >
          <span className="break-words">{formatDashboardCondition(condition)}</span>
          <span className="shrink-0">{trainingCount}회 →</span>
        </button>
      </li>
    ))}
  </ul>
)

/** 데이터가 존재하는 페이지 범위 안에서만 이동합니다. */
export const DetailPagination = ({
  page,
  totalPages,
  label,
  onChange,
}: {
  page: number
  totalPages: number
  label: string
  onChange: (page: number) => void
}) =>
  totalPages > 1 ? (
    <nav
      aria-label={label}
      className="gap-3 flex items-center justify-center text-label text-label-neutral"
    >
      <button
        type="button"
        className={detailButtonClass}
        disabled={page === 0}
        onClick={() => onChange(page - 1)}
      >
        이전
      </button>
      <span>
        {page + 1} / {totalPages}
      </span>
      <button
        type="button"
        className={detailButtonClass}
        disabled={page + 1 >= totalPages}
        onClick={() => onChange(page + 1)}
      >
        다음
      </button>
    </nav>
  ) : null
