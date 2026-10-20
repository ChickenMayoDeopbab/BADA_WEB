import type { ReactNode } from 'react'
import type { UseQueryResult } from '@tanstack/react-query'
import type {
  DashboardCondition,
  DashboardConditionCount,
  DashboardSummary,
} from '@entities/dashboard'
import { LoadingRegion, Skeleton, StatusState } from '@shared/ui'
import { formatDuration } from '@shared/lib'
import { formatDashboardCondition } from '../model/dashboardDetails'

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
