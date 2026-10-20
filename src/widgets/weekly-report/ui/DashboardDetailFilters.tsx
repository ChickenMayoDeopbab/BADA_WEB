import { IoOptionsOutline } from 'react-icons/io5'
import type { DashboardDetailsModel } from '../model/useDashboardDetails'
import calendarIcon from '@shared/assets/training-records/calendar.svg'
import { useDashboardDateCalendar } from '../model/useDashboardDateCalendar'
import { useDashboardFilterDialog } from '../model/useDashboardFilterDialog'
import { DashboardDateCalendar } from './DashboardDateCalendar'
import { DashboardFilterDialog } from './DashboardFilterDialog'
import { detailButtonClass, detailFieldClass } from './DashboardDetailParts'

/** 날짜와 훈련 조건을 입력하고 명시적으로 적용합니다. */
export const DashboardDetailFilters = ({ model }: { model: DashboardDetailsModel }) => {
  const { draft, setDraft } = model
  const calendar = useDashboardDateCalendar(draft, (range) => setDraft({ ...draft, ...range }))
  const filters = useDashboardFilterDialog(model)
  return (
    <>
      <form onSubmit={model.handleApply} aria-label="통계 상세 조회 조건" className="space-y-3">
        <div className="gap-3 grid grid-cols-2">
          {(['from', 'to'] as const).map((field) => (
            <div key={field} className="min-w-0 gap-2 flex flex-col text-label text-label-neutral">
              <span id={`dashboard-${field}-label`}>{field === 'from' ? '시작일' : '종료일'}</span>
              <button
                type="button"
                aria-labelledby={`dashboard-${field}-label dashboard-${field}-value`}
                aria-haspopup="dialog"
                aria-expanded={calendar.isOpen}
                onClick={() => calendar.handleOpen(field)}
                className={`${detailFieldClass} gap-2 flex items-center justify-between text-left hover:border-line-neutral`}
              >
                <span id={`dashboard-${field}-value`}>{draft[field].replaceAll('-', '.')}</span>
                <img src={calendarIcon} alt="" className="size-5 shrink-0" />
              </button>
            </div>
          ))}
        </div>
        {model.validationError && (
          <p role="alert" className="text-label text-status-error">
            {model.validationError}
          </p>
        )}
        <div className="gap-3 flex items-center justify-between">
          <button
            type="button"
            aria-haspopup="dialog"
            aria-expanded={filters.isOpen}
            onClick={filters.handleOpen}
            className="gap-2 px-3 py-2 flex items-center rounded-control border border-line-normal text-label text-label-neutral hover:bg-fill-normal"
          >
            <IoOptionsOutline size={18} aria-hidden="true" />
            훈련 골라보기
          </button>
          <button type="submit" className={`${detailButtonClass} bg-primary-normal`}>
            적용하기
          </button>
        </div>
      </form>
      <DashboardDateCalendar model={calendar} />
      <DashboardFilterDialog
        model={filters}
        isScenarioView={model.view === 'scenarios'}
        error={model.validationError}
      />
    </>
  )
}
