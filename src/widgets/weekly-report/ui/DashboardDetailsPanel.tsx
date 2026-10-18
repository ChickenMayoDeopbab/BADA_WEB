import { OverlayPortal, BackIcon } from '@shared/ui'
import { useDialogFocus } from '@shared/lib'
import type { DashboardDetailsModel } from '../model/useDashboardDetails'
import { DashboardDetailFilters } from './DashboardDetailFilters'
import { DashboardComparisonDetail } from './DashboardComparisonDetail'
import { DashboardScenarioDetail } from './DashboardScenarioDetail'
import { DashboardRelatedRecords } from './DashboardRelatedRecords'
import { detailButtonClass } from './DashboardDetailParts'

/** 대시보드 배치를 유지하며 통계 상세를 오른쪽 패널에서 표시합니다. */
export const DashboardDetailsPanel = ({ model }: { model: DashboardDetailsModel }) => {
  const dialogRef = useDialogFocus<HTMLElement>(true, model.handleClose)
  return (
    <OverlayPortal>
      <button
        type="button"
        onClick={model.handleClose}
        aria-label="통계 상세 배경 닫기"
        tabIndex={-1}
        className="inset-0 fixed z-60 cursor-default bg-transparent"
      />
      <aside
        ref={dialogRef}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-labelledby="dashboard-details-title"
        className="ux-drawer right-4 top-4 bottom-4 fixed z-70 flex w-[540px] max-w-[calc(100%-32px)] flex-col overflow-hidden rounded-dialog bg-background-normal shadow-elevated-card motion-reduce:animate-none"
      >
        <header className="gap-3 p-5 flex shrink-0 items-center justify-between border-b border-line-alternative">
          <h2 id="dashboard-details-title" className="text-headline1 font-bold text-label-normal">
            {model.view === 'comparison' ? '기간 비교' : '상황별 현황'}
          </h2>
          <button
            type="button"
            onClick={model.handleClose}
            aria-label="통계 상세 닫기"
            className="size-10 flex items-center justify-center rounded-control hover:bg-fill-normal"
          >
            <BackIcon />
          </button>
        </header>
        <div className="min-h-0 space-y-5 p-5 overflow-y-auto overscroll-contain">
          <div role="group" aria-label="통계 상세 보기" className="gap-2 flex flex-wrap">
            {(['comparison', 'scenarios'] as const).map((view) => (
              <button
                key={view}
                type="button"
                aria-pressed={model.view === view}
                className={`${detailButtonClass} ${model.view === view ? 'bg-primary-alternative' : ''}`}
                onClick={() => model.handleOpen(view)}
              >
                {view === 'comparison' ? '기간 비교' : '상황별 현황'}
              </button>
            ))}
          </div>
          <DashboardDetailFilters model={model} />
          {model.view === 'comparison' ? (
            <DashboardComparisonDetail model={model} />
          ) : (
            <DashboardScenarioDetail model={model} />
          )}
          <DashboardRelatedRecords model={model} />
        </div>
      </aside>
    </OverlayPortal>
  )
}
