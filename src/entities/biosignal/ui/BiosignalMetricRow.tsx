import { BiosignalPeakMarker } from './BiosignalChartView'

interface BiosignalMetricRowProps {
  label: string
  value: string
  hasMarker?: boolean
}

/** 이름과 값을 한 줄로 적습니다. `dl` 안에서 씁니다. */
export const BiosignalMetricRow = ({
  label,
  value,
  hasMarker = false,
}: BiosignalMetricRowProps) => (
  <div className="gap-3 flex items-center justify-between">
    <dt className="shrink-0 text-body font-medium text-label-alternative">{label}</dt>
    <dd className="gap-x-2 m-0 flex flex-1 items-center justify-end">
      {hasMarker && <BiosignalPeakMarker />}
      <span className="text-right text-body font-bold text-label-neutral">{value}</span>
    </dd>
  </div>
)
