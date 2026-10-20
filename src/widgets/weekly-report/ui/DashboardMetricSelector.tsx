import type { DashboardMetricKey } from '@entities/dashboard'
import { weeklyMetrics } from '../model/buildWeeklyMetricDays'

/** 여섯 지표 중 하나를 선택해 같은 자리에 표시합니다. */
export const DashboardMetricSelector = ({
  value,
  onChange,
}: {
  value: DashboardMetricKey
  onChange: (key: DashboardMetricKey) => void
}) => (
  <div role="group" aria-label="지표 선택" className="gap-1 sm:gap-2 flex">
    {weeklyMetrics.map(({ key, label }) => (
      <button
        key={key}
        type="button"
        aria-pressed={value === key}
        onClick={() => onChange(key)}
        className={`min-w-0 px-1 py-2 sm:flex-1 sm:px-2 sm:py-2.5 grow rounded-control border bg-background-normal transition-colors ${
          value === key
            ? 'border-primary-normal text-primary-normal'
            : 'border-line-neutral text-label-alternative hover:bg-fill-normal'
        }`}
      >
        <span className="sm:text-label block text-caption font-bold whitespace-nowrap">
          {label}
        </span>
      </button>
    ))}
  </div>
)
