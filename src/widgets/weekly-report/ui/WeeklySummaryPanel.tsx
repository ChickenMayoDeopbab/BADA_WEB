import { useWeeklySummary } from '@entities/dashboard'
import { formatDuration } from '@shared/lib'

// 이번 주 훈련 횟수, 총 통화 시간, 요약 문구를 표시합니다.
export const WeeklySummaryPanel = () => {
  const { data: summary, isPending, isError } = useWeeklySummary()

  return (
    <section className="gap-3.5 p-5 rounded-2xl flex h-full w-[340px] shrink-0 flex-col bg-fill-normal">
      <h2 className="text-headline1 font-bold text-label-normal">주간 요약</h2>
      {summary ? (
        <>
          <p className="text-body font-bold text-label-normal">
            {summary.trainingCount}회 훈련 · 총 {formatDuration(summary.totalCallDurationSeconds)}
          </p>
          <p className="text-body text-label-neutral">{summary.comment}</p>
        </>
      ) : (
        <p className="text-body text-label-neutral">
          {isPending ? '주간 요약을 불러오고 있어요' : isError && '주간 요약을 불러오지 못했어요'}
        </p>
      )}
      <p className="text-caption text-neutral-60">매주 월요일 아침에 업데이트돼요</p>
    </section>
  )
}
