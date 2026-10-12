import { useRecentAttendanceDays } from '../model/useRecentAttendanceDays'
import { useWeeklySummary } from '@entities/dashboard'
import callIcon from '@shared/assets/dashboard/call.svg'

// 이번 주 훈련 횟수와 최근 7일 출석 여부를 표시합니다.
export const WeeklyTrainingStrip = () => {
  const { data: weeklySummary } = useWeeklySummary()
  const days = useRecentAttendanceDays()

  return (
    <section
      className="px-6 flex h-[77px] w-[547px] shrink-0 items-center justify-between rounded-dialog bg-background-normal"
      aria-label="이번 주 훈련"
    >
      <div className="gap-0.5 flex flex-col">
        <p className="text-label font-medium text-neutral-60">이번 주 훈련</p>
        <p className="text-body font-bold text-label-normal">
          {weeklySummary
            ? `이번 주 ${weeklySummary.trainingCount}회 훈련했어요`
            : '이번 주 훈련 기록을 불러오고 있어요'}
        </p>
      </div>
      <ol className="gap-2.5 flex items-start">
        {days.map((day) => (
          <li key={day.dateKey} className="w-8 gap-1 flex flex-col items-center">
            <span
              className={`size-7 flex items-center justify-center rounded-pill ${
                day.isAttended ? 'bg-primary-normal' : 'bg-fill-alternative'
              }`}
            >
              {day.isAttended && <img src={callIcon} alt="" width={16} height={16} />}
            </span>
            <span
              className={`text-caption ${
                day.isToday ? 'font-bold text-label-normal' : 'font-medium text-neutral-60'
              }`}
            >
              {day.label}
              <span className="sr-only">{day.isAttended ? ' 출석' : ' 미출석'}</span>
            </span>
          </li>
        ))}
      </ol>
    </section>
  )
}
