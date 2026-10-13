import { WeeklyMetricsPanel } from './WeeklyMetricsPanel'
import { WeeklySummaryPanel } from './WeeklySummaryPanel'

// 주간 지표 차트와 주간 요약을 나란히 표시합니다.
export const WeeklyReport = () => (
  <div className="gap-4 flex h-[240px]">
    <WeeklyMetricsPanel />
    <WeeklySummaryPanel />
  </div>
)
