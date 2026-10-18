import { useDashboardDetails } from '../model/useDashboardDetails'
import { DashboardDetailsPanel } from './DashboardDetailsPanel'
import { WeeklyMetricsPanel } from './WeeklyMetricsPanel'
import { WeeklySummaryPanel } from './WeeklySummaryPanel'

// 기존 주간 차트·요약 배치를 유지하고 상세 조회 패널을 연결합니다.
export const WeeklyReport = () => {
  const details = useDashboardDetails()
  return (
    <>
      <div className="gap-4 max-xl:h-auto max-xl:flex-col flex h-[240px]">
        <WeeklyMetricsPanel
          onOpenComparison={() => details.handleOpen('comparison')}
          onOpenScenarios={() => details.handleOpen('scenarios')}
        />
        <WeeklySummaryPanel />
      </div>
      {details.view !== null && <DashboardDetailsPanel model={details} />}
    </>
  )
}
