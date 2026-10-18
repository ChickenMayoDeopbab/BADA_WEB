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
  <div role="group" aria-label="지표 선택" className="gap-2 grid grid-cols-3">
    {weeklyMetrics.map(({ key, label }) => (
      <button
        key={key}
        type="button"
        aria-pressed={value === key}
        onClick={() => onChange(key)}
        className={`min-w-0 px-2 py-2.5 rounded-control text-label font-medium transition-colors ${
          value === key
            ? 'bg-primary-alternative font-bold text-label-normal'
            : 'bg-fill-normal text-label-alternative hover:bg-fill-pressed'
        }`}
      >
        {label}
      </button>
    ))}
  </div>
)
