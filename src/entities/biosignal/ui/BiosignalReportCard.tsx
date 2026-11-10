import { FiChevronDown } from 'react-icons/fi'
import { buildEdaChartGeometry, buildHeartChartGeometry } from '../model/biosignalChart'
import { formatPeakMoment, formatSigned } from '../model/biosignalReport'
import type {
  BiosignalEdaView,
  BiosignalHeartView,
  BiosignalReportView,
  BiosignalSkinTempView,
} from '../model/types'
import { useBiosignalDisclosure } from '../model/useBiosignalDisclosure'
import { BiosignalChartView } from './BiosignalChartView'
import { BiosignalMetricRow as MetricRow } from './BiosignalMetricRow'
import { BIOSIGNAL_DISCLAIMER, HEART_REACTION_NOTE } from './biosignalCopy'

const SectionTitle = ({ children }: { children: string }) => (
  <h4 className="text-body font-bold text-label-normal">{children}</h4>
)

// 심박 흐름과 평소 대비 변화를 표시합니다. 절대 bpm은 펼쳐야 보입니다.
const HeartSection = ({ heart }: { heart: BiosignalHeartView }) => {
  const { panelId, isExpanded, handleToggle } = useBiosignalDisclosure()
  const { chart, callChange, peak, recoveryPct, sentence, baselineBpm } = heart
  const numberRows = [
    baselineBpm !== null ? { label: '평소 심박', value: `${Math.round(baselineBpm)} bpm` } : null,
    peak ? { label: '가장 높을 때', value: `${Math.round(peak.bpm)} bpm` } : null,
  ].filter((row): row is { label: string; value: string } => row !== null)

  return (
    <section className="gap-4 flex flex-col">
      <SectionTitle>{'심박'}</SectionTitle>
      {callChange && <p className="text-body font-bold text-label-neutral">{callChange}</p>}
      {chart && (
        <BiosignalChartView
          geometry={buildHeartChartGeometry(chart, peak)}
          label={'통화 전부터 끊은 뒤까지의 심박 흐름 그래프'}
        />
      )}
      {(peak || recoveryPct !== null) && (
        <dl className="gap-3 m-0 flex flex-col">
          {peak && (
            <MetricRow
              label={'가장 높았던 순간'}
              value={formatPeakMoment(peak)}
              hasMarker={chart !== null}
            />
          )}
          {recoveryPct !== null && (
            <MetricRow label={'끊고 1분 동안'} value={`평소 쪽으로 ${recoveryPct}% 돌아왔어요`} />
          )}
        </dl>
      )}
      {sentence && <p className="text-body font-medium text-label-neutral">{sentence}</p>}
      {numberRows.length > 0 && (
        <div>
          <button
            type="button"
            aria-expanded={isExpanded}
            aria-controls={panelId}
            onClick={handleToggle}
            className="py-1 flex w-full items-center justify-between rounded-control text-left text-body font-medium text-label-alternative transition-colors hover:text-label-neutral"
          >
            {'심박 숫자'}
            <FiChevronDown
              aria-hidden="true"
              className={`size-6 ease-out ux-accordion shrink-0 text-line-normal transition-transform motion-reduce:transition-none ${isExpanded ? 'rotate-180' : ''}`}
            />
          </button>
          <div
            id={panelId}
            aria-hidden={!isExpanded}
            inert={!isExpanded}
            className={`ease-out ux-accordion grid transition-[grid-template-rows,opacity] motion-reduce:transition-none ${isExpanded ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}
          >
            <div className="min-h-0 overflow-hidden">
              <dl className="gap-3 pt-3 m-0 flex flex-col">
                {numberRows.map((row) => (
                  <MetricRow key={row.label} label={row.label} value={row.value} />
                ))}
              </dl>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}

// 피부전도 센서가 있는 워치로 잰 통화만 표시합니다.
const EdaSection = ({ eda }: { eda: BiosignalEdaView }) => (
  <section className="gap-4 flex flex-col">
    <SectionTitle>{'피부전도'}</SectionTitle>
    {eda.chart && (
      <BiosignalChartView
        geometry={buildEdaChartGeometry(eda.chart)}
        label={'통화 전부터 끊은 뒤까지의 피부전도 흐름 그래프'}
      />
    )}
    {(eda.callChangePct !== null || eda.risesPerMin !== null) && (
      <dl className="gap-3 m-0 flex flex-col">
        {eda.callChangePct !== null && (
          <MetricRow label={'통화 중 평소 대비'} value={`${formatSigned(eda.callChangePct, 0)}%`} />
        )}
        {eda.risesPerMin !== null && (
          <MetricRow
            label={'통화 중 짧게 오른 횟수'}
            value={`1분에 ${eda.risesPerMin.toFixed(1)}번`}
          />
        )}
      </dl>
    )}
  </section>
)

// 손목 피부 온도는 곡선 없이 숫자만 표시합니다. 체온이 아닙니다.
const SkinTempSection = ({ skinTemp }: { skinTemp: BiosignalSkinTempView }) => (
  <section className="gap-4 flex flex-col">
    <SectionTitle>{'손목 피부 온도'}</SectionTitle>
    <dl className="gap-3 m-0 flex flex-col">
      {skinTemp.callMeanC !== null && (
        <MetricRow label={'통화 중 평균'} value={`${skinTemp.callMeanC.toFixed(1)}°C`} />
      )}
      {skinTemp.callDeltaC !== null && (
        <MetricRow label={'평소 대비'} value={`${formatSigned(skinTemp.callDeltaC, 1)}°C`} />
      )}
    </dl>
  </section>
)

interface BiosignalReportCardProps {
  view: BiosignalReportView
}

/** 훈련 기록의 '몸의 반응' 카드입니다. 통화 전부터 끊은 뒤까지 몸이 어떻게 움직였는지 보여 줍니다. */
export const BiosignalReportCard = ({ view }: BiosignalReportCardProps) => (
  <section className="gap-2.5 flex flex-col break-keep">
    <h3 className="text-label font-medium text-label-alternative">{'몸의 반응'}</h3>
    <div className="gap-5 px-3 py-4 [&>section:not(:last-child)]:pb-5 flex flex-col divide-y divide-line-alternative rounded-component bg-background-normal shadow-subtle-card">
      {view.heart && <HeartSection heart={view.heart} />}
      {view.eda && <EdaSection eda={view.eda} />}
      {view.skinTemp && <SkinTempSection skinTemp={view.skinTemp} />}
    </div>
    <p className="px-1 text-caption text-label-alternative">
      {view.heart && `${HEART_REACTION_NOTE} `}
      {BIOSIGNAL_DISCLAIMER}
    </p>
  </section>
)
