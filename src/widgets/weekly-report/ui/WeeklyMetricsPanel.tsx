import {
  buildWeeklyMetricDays,
  formatWeeklyMetric,
  getWeeklyMetricBarHeight,
  weeklyMetrics,
} from '../model/buildWeeklyMetricDays'
import { Skeleton, LoadingRegion, StatusState } from '@shared/ui'
import { useWeeklyDashboardOverview } from '@entities/dashboard'

/** 기존 주간 차트 영역에 개요 API의 6개 지표를 원래 단위로 표시합니다. */
export const WeeklyMetricsPanel = () => {
  const { data: overview, isError, isPending, refetch, isFetching } = useWeeklyDashboardOverview()
  const days = buildWeeklyMetricDays(overview)

  return (
    <section className="min-w-0 gap-2.5 p-5 rounded-2xl flex h-full min-h-[240px] flex-1 flex-col bg-fill-normal">
      <h2 className="text-headline1 font-bold text-label-normal">{'주간 지표'}</h2>
      <ul
        aria-label="주간 지표 평균"
        className="gap-3.5 flex shrink-0 [scrollbar-width:none] items-center overflow-x-auto [&::-webkit-scrollbar]:hidden"
      >
        {weeklyMetrics.map((metric) => (
          <li
            key={metric.key}
            className="flex shrink-0 items-center gap-[5px]"
            title={metric.description}
          >
            <span aria-hidden="true" className={`size-2 rounded-pill ${metric.colorClassName}`} />
            <span className="text-caption font-medium whitespace-nowrap text-label-neutral">
              {metric.label}
              {overview && ` ${formatWeeklyMetric(overview.metrics[metric.key], metric.unit)}`}
            </span>
          </li>
        ))}
      </ul>
      {isPending ? (
        <LoadingRegion label={'주간 지표를 불러오는 중'}>
          <div className="gap-4 flex h-[112px] items-end justify-between">
            {Array.from({ length: 7 }, (_, i) => (
              <Skeleton key={i} className="h-20 flex-1" />
            ))}
          </div>
        </LoadingRegion>
      ) : isError && !overview ? (
        <StatusState
          isError
          title={'주간 지표를 불러오지 못했어요'}
          onRetry={() => void refetch()}
          isRetrying={isFetching}
        />
      ) : (
        <ol aria-label="요일별 훈련 지표" className="flex w-full items-start">
          {days.map((day) => (
            <li key={day.dateKey} className="min-w-0 gap-1.5 flex flex-1 flex-col items-center">
              <div className="gap-0.5 flex h-[84px] items-end justify-center">
                {weeklyMetrics.map((metric) => {
                  const measurement = day.metrics[metric.key]
                  const isMissing =
                    !measurement || measurement.value === null || measurement.status === 'NO_DATA'
                  const label = `${day.dateKey} ${metric.label} ${formatWeeklyMetric(measurement, metric.unit)}`
                  return (
                    <span
                      key={metric.key}
                      role="img"
                      aria-label={label}
                      title={`${label} · 표본 ${measurement?.sampleCount ?? 0}건`}
                      className={`ux-transition w-1 rounded-control transition-[height] ${isMissing ? 'bg-fill-alternative' : metric.colorClassName}`}
                      style={{ height: getWeeklyMetricBarHeight(day, metric.key, days) }}
                    />
                  )
                })}
              </div>
              <span className="text-label font-medium text-label-alternative">{day.label}</span>
            </li>
          ))}
        </ol>
      )}
      <p className="text-caption text-neutral-60">
        {isError
          ? '주간 지표를 불러오지 못했어요'
          : '불안 0~10점 · 비율 0~100% · 응답 시간은 주간 최댓값 기준 · 회색은 미측정'}
      </p>
    </section>
  )
}
