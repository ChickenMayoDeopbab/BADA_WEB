import { useTranslation } from '@shared/lib'
import { useAttendanceCalendar } from '../model/useAttendanceCalendar'
import { AttendanceCheckButton } from '@features/attendance-check'
import arrowIcon from '@shared/assets/dashboard/calendar-arrow.svg'
import { Skeleton, LoadingRegion, StatusState } from '@shared/ui'
import { WEEKDAY_LABELS } from '@shared/lib'

// 요일 헤더 색상을 반환합니다. 일요일과 토요일은 강조 색상을 사용합니다.
const getWeekdayClassName = (index: number) => {
  if (index === 0) {
    return 'text-status-error'
  }

  return index === 6 ? 'text-status-info' : 'text-label-alternative'
}

// 월별 출석 달력과 오늘 출석 버튼을 표시합니다.
export const AttendanceCalendar = () => {
  const { t } = useTranslation()

  const {
    title,
    weeks,
    isPending,
    isError,
    isFetching,
    refetch,
    canGoNext,
    goPreviousMonth,
    goNextMonth,
  } = useAttendanceCalendar()

  return (
    <section className="p-5 gap-4 rounded-2xl max-xl:w-full flex w-[400px] shrink-0 flex-col justify-between bg-fill-normal">
      <div className="gap-2.5 flex flex-col">
        <div className="flex items-center justify-between">
          <button
            type="button"
            className="size-9 flex items-center justify-center rounded-control hover:bg-fill-neutral"
            aria-label={t('이전 달')}
            onClick={goPreviousMonth}
          >
            <img src={arrowIcon} alt="" width={9} height={18} />
          </button>
          <h2 className="text-headline1 font-bold text-label-normal">{title}</h2>
          {canGoNext ? (
            <button
              type="button"
              className="size-9 flex items-center justify-center rounded-control hover:bg-fill-neutral"
              aria-label={t('다음 달')}
              onClick={goNextMonth}
            >
              <img src={arrowIcon} alt="" width={9} height={18} className="rotate-180" />
            </button>
          ) : (
            <span className="size-9" aria-hidden="true" />
          )}
        </div>
        <div className="flex">
          {WEEKDAY_LABELS.map((weekday, index) => (
            <span
              key={weekday}
              className={`h-6 flex-1 text-center text-caption font-bold ${getWeekdayClassName(index)}`}
            >
              {weekday}
            </span>
          ))}
        </div>
        {isPending ? (
          <LoadingRegion label={t('출석 기록을 불러오는 중')}>
            <div className="gap-2 grid grid-cols-7">
              {Array.from({ length: weeks.length * 7 }, (_, i) => (
                <Skeleton key={i} className="size-8 mx-auto rounded-pill" />
              ))}
            </div>
          </LoadingRegion>
        ) : isError ? (
          <StatusState
            isError
            title={t('출석 기록을 불러오지 못했어요')}
            onRetry={() => void refetch()}
            isRetrying={isFetching}
          />
        ) : (
          weeks.map((week, weekIndex) => (
            <div key={weekIndex} className="flex">
              {week.map((day, dayIndex) => (
                <div
                  key={day?.dateKey ?? `blank-${dayIndex}`}
                  className="flex h-[38px] flex-1 items-center justify-center"
                >
                  {day && (
                    <span
                      className={`size-8 flex items-center justify-center rounded-pill text-label font-bold ${
                        day.isAttended ? 'bg-green-40 text-common-0' : 'text-label-neutral'
                      }`}
                    >
                      {day.date}
                      {day.isAttended && <span className="sr-only">{t('일 출석')}</span>}
                    </span>
                  )}
                </div>
              ))}
            </div>
          ))
        )}
      </div>
      <AttendanceCheckButton />
    </section>
  )
}
