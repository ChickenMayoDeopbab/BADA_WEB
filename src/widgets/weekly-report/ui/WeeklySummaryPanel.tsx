import { useWeeklySummary } from '@entities/dashboard'
import { Skeleton, LoadingRegion, StatusState } from '@shared/ui'
import { formatDuration } from '@shared/lib'

// 이번 주 훈련 횟수, 총 통화 시간, 요약 문구를 표시합니다.
export const WeeklySummaryPanel = () => {
  const { data: summary, isPending, isError, refetch, isFetching } = useWeeklySummary()

  return (
    <section className="gap-3.5 p-5 rounded-2xl max-xl:w-full flex h-full w-[340px] shrink-0 flex-col bg-fill-normal">
      <h2 className="text-headline1 font-bold text-label-normal">{'주간 요약'}</h2>
      {summary ? (
        <>
          <p className="text-body font-bold text-label-normal">
            {summary.trainingCount}
            {'회 훈련 · 총'} {formatDuration(summary.totalCallDurationSeconds)}
          </p>
          <p className="text-body text-label-neutral">{summary.comment}</p>
        </>
      ) : isPending ? (
        <LoadingRegion label={'주간 요약을 불러오는 중'}>
          <Skeleton className="h-5 w-2/3" />
          <Skeleton className="mt-4 h-14" />
        </LoadingRegion>
      ) : (
        <StatusState
          isError={isError}
          title={isError ? '주간 요약을 불러오지 못했어요' : '아직 주간 요약이 없어요'}
          onRetry={isError ? () => void refetch() : undefined}
          isRetrying={isFetching}
        />
      )}
      <p className="text-caption text-neutral-60">{'매주 월요일 아침에 업데이트돼요'}</p>
    </section>
  )
}
