import { buildHeartChartGeometry } from '../model/biosignalChart'
import type { BiosignalSummary } from '../model/biosignalSummary'
import { BiosignalChartView } from './BiosignalChartView'
import { BiosignalMetricRow } from './BiosignalMetricRow'
import { BIOSIGNAL_DISCLAIMER, HEART_REACTION_NOTE } from './biosignalCopy'

interface BiosignalReportSummaryProps {
  summary: BiosignalSummary
}

/** 대시보드용 '몸의 반응' 요약입니다. 넓은 화면에서는 심박 흐름 옆에 지표를 둡니다. */
export const BiosignalReportSummary = ({ summary }: BiosignalReportSummaryProps) => {
  const { callChange, chart, peak, rows } = summary
  const hasHeartFlow = Boolean(callChange || chart)

  return (
    <div className="gap-2.5 flex flex-col break-keep">
      <div className="gap-5 p-4 lg:flex-row lg:items-center flex flex-col rounded-component bg-background-normal shadow-subtle-card">
        {hasHeartFlow && (
          <div className="min-w-0 gap-3 flex flex-[3] flex-col">
            {callChange && <p className="text-body font-bold text-label-neutral">{callChange}</p>}
            {chart && (
              <BiosignalChartView
                geometry={buildHeartChartGeometry(chart, peak)}
                label={'통화 전부터 끊은 뒤까지의 심박 흐름 그래프'}
              />
            )}
          </div>
        )}
        {rows.length > 0 && (
          <dl className="min-w-0 gap-3 m-0 flex flex-[2] flex-col">
            {rows.map((row) => (
              <BiosignalMetricRow key={row.label} {...row} />
            ))}
          </dl>
        )}
      </div>
      <p className="px-1 text-caption text-label-alternative">
        {hasHeartFlow && `${HEART_REACTION_NOTE} `}
        {BIOSIGNAL_DISCLAIMER}
      </p>
    </div>
  )
}
