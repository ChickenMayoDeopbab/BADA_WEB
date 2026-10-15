import {
  buildWeeklyMetricDays,
  METRIC_MAX_SCORE,
  type MetricKey,
} from '../model/buildWeeklyMetricDays'
import { Skeleton, LoadingRegion, StatusState } from '@shared/ui'
import { useDashboardMetrics } from '@entities/dashboard'
import conversationDot from '@shared/assets/dashboard/legend-conversation.svg'
import fluencyDot from '@shared/assets/dashboard/legend-fluency.svg'
import stabilityDot from '@shared/assets/dashboard/legend-stability.svg'

const BAR_MAX_HEIGHT = 84
const EMPTY_BAR_HEIGHT = 4

const METRICS: { key: MetricKey; label: string; dot: string; barClassName: string }[] = [
  { key: 'stability', label: '안정도', dot: stabilityDot, barClassName: 'bg-metric-stability' },
  {
    key: 'conversation',
    label: '대화 유지',
    dot: conversationDot,
    barClassName: 'bg-metric-conversation',
  },
  { key: 'fluency', label: '유창성', dot: fluencyDot, barClassName: 'bg-metric-fluency' },
]

// 점수를 막대 높이로 변환합니다. 기록이 없으면 최소 높이 막대를 표시합니다.
const getBarHeight = (score: number | null) =>
  score === null
    ? EMPTY_BAR_HEIGHT
    : Math.max(EMPTY_BAR_HEIGHT, Math.round((score / METRIC_MAX_SCORE) * BAR_MAX_HEIGHT))

// 이번 주 요일별 안정도·대화 유지·유창성 점수를 막대 차트로 표시합니다.
export const WeeklyMetricsPanel = () => {
  const { data: metrics, isError, isPending, refetch, isFetching } = useDashboardMetrics()
  const days = buildWeeklyMetricDays(metrics)

  return (
    <section className="min-w-0 gap-2.5 p-5 rounded-2xl flex h-full min-h-[240px] flex-1 flex-col bg-fill-normal">
      <h2 className="text-headline1 font-bold text-label-normal">{'주간 지표'}</h2>
      <ul className="gap-3.5 flex items-center">
        {METRICS.map((metric) => (
          <li key={metric.key} className="flex items-center gap-[5px]">
            <img src={metric.dot} alt="" width={8} height={8} />
            <span className="text-caption font-medium text-label-neutral">{metric.label}</span>
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
      ) : isError && !metrics ? (
        <StatusState
          isError
          title={'주간 지표를 불러오지 못했어요'}
          onRetry={() => void refetch()}
          isRetrying={isFetching}
        />
      ) : (
        <ol className="flex w-full items-start">
          {days.map((day) => (
            <li key={day.dateKey} className="min-w-0 gap-1.5 flex flex-1 flex-col items-center">
              <div className="gap-1 flex h-[84px] items-end justify-center">
                {METRICS.map((metric) => {
                  const score = day.scores[metric.key]

                  return (
                    <span
                      key={metric.key}
                      className={`ux-transition w-2.5 transition-[height] ${score === null ? 'rounded-[2px]' : 'rounded-[3px]'} ${metric.barClassName}`}
                      style={{ height: getBarHeight(score) }}
                      title={`${metric.label} ${score === null ? '기록 없음' : `${score}점`}`}
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
        {isError ? '주간 지표를 불러오지 못했어요' : '각 지표는 높을수록 좋아요'}
      </p>
    </section>
  )
}
