import { formatTrainingRecordDateRange } from '../model/formatTrainingRecordDateRange'
import type { TrainingRecordDateRange } from '../model/useTrainingRecordCalendar'

const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토']

interface CalendarMonthProps {
  month: Date
  range: TrainingRecordDateRange
  onPreviousMonth: () => void
  onNextMonth: () => void
  onSelectDate: (date: Date) => void
}

interface TrainingRecordCalendarProps {
  isOpen: boolean
  isSelectingEnd: boolean
  visibleMonth: Date
  range: TrainingRecordDateRange
  onCancel: () => void
  onApply: () => void
  onPreviousMonth: () => void
  onNextMonth: () => void
  onSelectDate: (date: Date) => void
}

// 두 날짜가 같은 연월일인지 확인합니다.
const isSameDate = (firstDate: Date, secondDate: Date) =>
  firstDate.getFullYear() === secondDate.getFullYear() &&
  firstDate.getMonth() === secondDate.getMonth() &&
  firstDate.getDate() === secondDate.getDate()

// 달력에 표시할 빈 칸과 날짜 목록을 만듭니다.
const getCalendarDays = (month: Date) => {
  const year = month.getFullYear()
  const monthIndex = month.getMonth()
  const firstWeekday = new Date(year, monthIndex, 1).getDay()
  const lastDate = new Date(year, monthIndex + 1, 0).getDate()

  const populatedDays = [
    ...Array.from({ length: firstWeekday }, () => null),
    ...Array.from({ length: lastDate }, (_, index) => new Date(year, monthIndex, index + 1)),
  ]

  return [...populatedDays, ...Array.from({ length: 42 - populatedDays.length }, () => null)]
}

// 한 달의 날짜 선택 그리드를 표시합니다.
const CalendarMonth = ({
  month,
  range,
  onPreviousMonth,
  onNextMonth,
  onSelectDate,
}: CalendarMonthProps) => {
  const days = getCalendarDays(month)

  return (
    <section className="min-h-0 min-w-0 px-6 py-5 flex-1">
      <div className="mb-5 flex items-center justify-between">
        <button
          type="button"
          className="size-10 flex items-center justify-center rounded-control border border-line-alternative text-title2 text-label-normal transition-colors hover:bg-fill-normal"
          aria-label="이전 달"
          onClick={onPreviousMonth}
        >
          ‹
        </button>
        <h3 className="text-center text-headline1 font-bold text-label-normal">
          {month.getFullYear()}년 {month.getMonth() + 1}월
        </h3>
        <button
          type="button"
          className="size-10 flex items-center justify-center rounded-control border border-line-alternative text-title2 text-label-normal transition-colors hover:bg-fill-normal"
          aria-label="다음 달"
          onClick={onNextMonth}
        >
          ›
        </button>
      </div>
      <div className="mb-2 grid grid-cols-7 text-center">
        {WEEKDAYS.map((weekday, index) => (
          <span
            key={weekday}
            className={`text-caption font-medium ${
              index === 0
                ? 'text-status-error'
                : index === 6
                  ? 'text-status-info'
                  : 'text-label-alternative'
            }`}
          >
            {weekday}
          </span>
        ))}
      </div>
      <div className="gap-y-1 grid grid-cols-7">
        {days.map((date, index) => {
          if (!date) {
            return <span key={`blank-${index}`} className="h-10" aria-hidden="true" />
          }

          const isRangeStart = isSameDate(date, range.start)
          const isRangeEnd = isSameDate(date, range.end)
          const isInRange = date >= range.start && date <= range.end
          const isSunday = date.getDay() === 0
          const isSaturday = date.getDay() === 6

          return (
            <button
              key={date.toISOString()}
              type="button"
              className={`size-10 mx-auto flex items-center justify-center rounded-pill text-label font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-normal ${
                isRangeStart || isRangeEnd
                  ? 'bg-primary-normal text-label-button-text'
                  : isInRange
                    ? 'bg-primary-alternative text-label-normal'
                    : isSunday
                      ? 'text-status-error hover:bg-fill-normal'
                      : isSaturday
                        ? 'text-status-info hover:bg-fill-normal'
                        : 'text-label-normal hover:bg-fill-normal'
              }`}
              aria-pressed={isInRange}
              aria-label={`${date.getFullYear()}년 ${date.getMonth() + 1}월 ${date.getDate()}일`}
              onClick={() => onSelectDate(date)}
            >
              {date.getDate()}
            </button>
          )
        })}
      </div>
    </section>
  )
}

// 한 달을 보며 훈련 기록 조회 범위를 선택하는 캘린더를 표시합니다.
export const TrainingRecordCalendar = ({
  isOpen,
  isSelectingEnd,
  visibleMonth,
  range,
  onCancel,
  onApply,
  onPreviousMonth,
  onNextMonth,
  onSelectDate,
}: TrainingRecordCalendarProps) => {
  if (!isOpen) {
    return null
  }

  return (
    <>
      <button
        type="button"
        className="inset-0 fixed z-40 cursor-default bg-common-100/20 backdrop-blur-[2px]"
        aria-label="날짜 선택 취소"
        onClick={onCancel}
      />
      <section
        className="fixed top-1/2 left-1/2 z-50 flex h-[560px] w-[440px] max-w-[calc(100%-32px)] -translate-x-1/2 -translate-y-1/2 flex-col overflow-hidden rounded-dialog bg-background-normal shadow-elevated-card"
        role="dialog"
        aria-modal="true"
        aria-label="훈련 기록 날짜 범위 선택"
      >
        <header className="px-7 py-5 border-b border-line-alternative">
          <div>
            <p className="text-label font-medium text-label-alternative">
              {isSelectingEnd ? '종료일을 선택해 주세요' : '조회 기간'}
            </p>
            <h2 className="text-headline1 font-bold text-label-normal">
              {formatTrainingRecordDateRange(range)}
            </h2>
          </div>
        </header>

        <CalendarMonth
          month={visibleMonth}
          range={range}
          onPreviousMonth={onPreviousMonth}
          onNextMonth={onNextMonth}
          onSelectDate={onSelectDate}
        />

        <footer className="gap-3 px-7 py-4 flex items-center justify-end border-t border-line-alternative">
          <button
            type="button"
            className="h-11 px-5 rounded-control border border-line-normal bg-background-normal text-body font-medium text-label-normal transition-colors hover:bg-fill-normal"
            onClick={onCancel}
          >
            취소
          </button>
          <button
            type="button"
            className="h-11 px-5 rounded-control bg-primary-normal text-body font-bold text-label-button-text transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
            disabled={isSelectingEnd}
            onClick={onApply}
          >
            적용
          </button>
        </footer>
      </section>
    </>
  )
}
