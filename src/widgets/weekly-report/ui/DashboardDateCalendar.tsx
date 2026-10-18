import { useDialogFocus } from '@shared/lib'
import { BackIcon, OverlayPortal } from '@shared/ui'
import type { DashboardDateCalendarModel } from '../model/useDashboardDateCalendar'

const weekdays = ['일', '월', '화', '수', '목', '금', '토']
const monthButtonClass =
  'size-10 flex items-center justify-center rounded-control border border-line-alternative text-title2 text-label-normal transition-colors hover:bg-fill-normal disabled:cursor-default disabled:opacity-30'

/** 훈련 기록과 같은 월별 캘린더에서 시작일·종료일과 선택 범위를 표시합니다. */
export const DashboardDateCalendar = ({ model }: { model: DashboardDateCalendarModel }) => {
  const dialogRef = useDialogFocus<HTMLElement>(model.isOpen, model.handleCancel)
  if (!model.isOpen) return null
  const [year, month] = model.visibleMonth.split('-').map(Number)

  return (
    <OverlayPortal>
      <button
        type="button"
        tabIndex={-1}
        aria-label="날짜 선택 취소"
        onClick={model.handleCancel}
        className="inset-0 fixed z-80 cursor-default bg-common-100/20 backdrop-blur-[2px]"
      />
      <section
        ref={dialogRef}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-label="통계 날짜 범위 선택"
        className="fixed top-1/2 left-1/2 z-90 flex h-[600px] max-h-[calc(100dvh-32px)] w-[440px] max-w-[calc(100%-32px)] -translate-x-1/2 -translate-y-1/2 flex-col overflow-hidden rounded-dialog bg-background-normal shadow-elevated-card"
      >
        <header className="space-y-3 px-7 py-5 border-b border-line-alternative">
          <h2 className="text-headline1 font-bold text-label-normal">조회 기간</h2>
          <div className="gap-3 grid grid-cols-2">
            {(['from', 'to'] as const).map((field) => (
              <button
                key={field}
                type="button"
                aria-pressed={model.activeField === field}
                onClick={() => model.handleChangeField(field)}
                className={`min-w-0 space-y-1 px-3 py-2 rounded-control border text-left ${
                  model.activeField === field
                    ? 'border-primary-normal bg-primary-alternative'
                    : 'border-line-alternative'
                }`}
              >
                <span className="block text-caption text-label-alternative">
                  {field === 'from' ? '시작일' : '종료일'}
                </span>
                <span className="block text-label font-bold text-label-normal">
                  {model.selection[field].replaceAll('-', '.')}
                </span>
              </button>
            ))}
          </div>
          <p className="text-caption text-label-alternative">
            {model.activeField === 'from' ? '시작일을 선택해 주세요.' : '종료일을 선택해 주세요.'}
          </p>
        </header>
        <div className="min-h-0 min-w-0 px-6 py-5 max-sm:px-3 flex-1 overflow-y-auto">
          <div className="mb-5 flex items-center justify-between">
            <button
              type="button"
              aria-label="이전 달"
              disabled={!model.canGoPrevious}
              onClick={() => model.handleChangeMonth(-1)}
              className={monthButtonClass}
            >
              <BackIcon />
            </button>
            <h3 className="text-headline1 font-bold text-label-normal">
              {year}년 {month}월
            </h3>
            <button
              type="button"
              aria-label="다음 달"
              disabled={!model.canGoNext}
              onClick={() => model.handleChangeMonth(1)}
              className={monthButtonClass}
            >
              ›
            </button>
          </div>
          <div className="mb-2 grid grid-cols-7 text-center">
            {weekdays.map((weekday, index) => (
              <span
                key={weekday}
                className={`text-caption font-medium ${index === 0 ? 'text-status-error' : index === 6 ? 'text-status-info' : 'text-label-alternative'}`}
              >
                {weekday}
              </span>
            ))}
          </div>
          <div className="gap-y-1 grid grid-cols-7">
            {model.days.map((date, index) => {
              if (!date) return <span key={index} className="h-10" aria-hidden="true" />
              const isEndpoint = date === model.selection.from || date === model.selection.to
              const isInRange = date >= model.selection.from && date <= model.selection.to
              const [dayYear, dayMonth, day] = date.split('-').map(Number)
              return (
                <button
                  key={date}
                  type="button"
                  aria-label={`${dayYear}년 ${dayMonth}월 ${day}일`}
                  aria-pressed={isInRange}
                  aria-current={date === model.today ? 'date' : undefined}
                  disabled={date > model.today || date < '2000-01-01'}
                  onClick={() => model.handleSelectDate(date)}
                  className={`size-10 mx-auto flex items-center justify-center rounded-pill text-label font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-normal disabled:text-label-disabled ${
                    isEndpoint
                      ? 'bg-primary-normal text-label-button-text'
                      : isInRange
                        ? 'bg-primary-alternative text-label-normal'
                        : 'text-label-normal enabled:hover:bg-fill-normal'
                  }`}
                >
                  {day}
                </button>
              )
            })}
          </div>
        </div>
        {model.error && (
          <p role="alert" className="px-7 pb-3 text-label text-status-error">
            {model.error}
          </p>
        )}
        <footer className="gap-3 px-7 py-4 flex shrink-0 justify-end border-t border-line-alternative">
          <button
            type="button"
            onClick={model.handleCancel}
            className="h-11 px-5 rounded-control border border-line-normal text-body font-medium text-label-normal hover:bg-fill-normal"
          >
            취소
          </button>
          <button
            type="button"
            onClick={model.handleApply}
            disabled={model.error !== null}
            className="h-11 px-5 rounded-control bg-primary-normal text-body font-bold text-label-button-text hover:opacity-90 disabled:opacity-40"
          >
            적용
          </button>
        </footer>
      </section>
    </OverlayPortal>
  )
}
