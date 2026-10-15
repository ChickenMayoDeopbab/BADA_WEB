import { useRecentAttendanceDays } from '../model/useRecentAttendanceDays'
import { useWeeklySummary } from '@entities/dashboard'
import { Skeleton, LoadingRegion } from '@shared/ui'
import callIcon from '@shared/assets/dashboard/call.svg'

// 이번 주 훈련 횟수와 최근 7일 출석 여부를 표시합니다.
export const WeeklyTrainingStrip = () => {
  const { data: weeklySummary, isPending, isError } = useWeeklySummary()
  const days = useRecentAttendanceDays()

  return (
    <section
      className="px-6 max-lg:w-full max-sm:px-4 max-sm:py-3 max-sm:h-auto max-sm:flex-col max-sm:items-start max-sm:gap-3 flex h-[77px] w-[547px] max-w-full shrink-0 items-center justify-between rounded-dialog bg-background-normal"
      aria-label="이번 주 훈련"
    >
      <div className="gap-0.5 flex flex-col">
        <p className="text-label font-medium text-neutral-60">이번 주 훈련</p>
        <div className="text-body font-bold text-label-normal">
          {weeklySummary ? (
            `이번 주 ${weeklySummary.trainingCount}회 훈련했어요`
          ) : isPending ? (
            <Skeleton className="h-5 w-40" />
          ) : isError ? (
            '이번 주 훈련 기록을 불러오지 못했어요'
          ) : (
            '이번 주 훈련 기록이 없어요'
          )}
        </div>
      </div>
      <ol className="gap-2.5 flex items-start">
        {days.map((day) => (
          <li key={day.dateKey} className="w-8 gap-1 flex flex-col items-center">
            <span
              className={`size-7 flex items-center justify-center rounded-pill ${
                day.isAttended ? 'bg-primary-normal' : 'bg-fill-alternative'
              }`}
            >
              {day.isPending ? (
                <LoadingRegion label="출석 확인 중">
                  <Skeleton className="size-7 rounded-pill" />
                </LoadingRegion>
              ) : (
                day.isAttended && <img src={callIcon} alt="" width={16} height={16} />
              )}
            </span>
            <span
              className={`text-caption ${
                day.isToday ? 'font-bold text-label-normal' : 'font-medium text-neutral-60'
              }`}
            >
              {day.label}
              <span className="sr-only">
                {day.isPending
                  ? ' 출석 확인 중'
                  : day.isError
                    ? ' 출석 확인 실패'
                    : day.isAttended
                      ? ' 출석'
                      : ' 미출석'}
              </span>
            </span>
          </li>
        ))}
      </ol>
    </section>
  )
}
