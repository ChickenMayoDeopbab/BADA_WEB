import { BIOSIGNAL_CHART_HEIGHT, type BiosignalChartGeometry } from '../model/biosignalChart'
import type { CSSProperties } from 'react'

/** 최고점 표시 반지름(8px)만큼 곡선 가장자리에서 띄웁니다. */
const PEAK_EDGE_PX = 8

/** 리포트 통화 타임라인 마커를 줄인 표시입니다. 곡선의 최고점과 '가장 높았던 순간' 줄을 잇습니다. */
export const BiosignalPeakMarker = ({
  className = '',
  style,
}: {
  className?: string
  style?: CSSProperties
}) => (
  <span
    className={`size-4 flex shrink-0 items-center justify-center rounded-pill border-[3px] border-green-40 bg-background-normal ${className}`}
    style={style}
    aria-hidden="true"
  >
    <span className="size-1.5 rounded-pill bg-green-40" />
  </span>
)

interface BiosignalChartViewProps {
  geometry: BiosignalChartGeometry
  label: string
}

/** 통화 전부터 끊은 뒤까지의 곡선을 그립니다. 가로는 카드 폭에 맞춰 늘이고 선 굵기는 유지합니다. */
export const BiosignalChartView = ({ geometry, label }: BiosignalChartViewProps) => (
  <figure className="m-0" role="img" aria-label={label}>
    <div className="relative" style={{ height: BIOSIGNAL_CHART_HEIGHT }}>
      <svg
        className="size-full overflow-visible"
        viewBox={`0 0 ${geometry.width} ${BIOSIGNAL_CHART_HEIGHT}`}
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        {geometry.boundaries.map((x) => (
          <line
            key={`boundary-${x}`}
            x1={x}
            y1={0}
            x2={x}
            y2={BIOSIGNAL_CHART_HEIGHT}
            className="stroke-line-neutral"
            strokeWidth={1}
            strokeDasharray="3 3"
            vectorEffect="non-scaling-stroke"
          />
        ))}
        <line
          x1={0}
          y1={BIOSIGNAL_CHART_HEIGHT - 0.5}
          x2={geometry.width}
          y2={BIOSIGNAL_CHART_HEIGHT - 0.5}
          className="stroke-line-alternative"
          strokeWidth={1}
          vectorEffect="non-scaling-stroke"
        />
        {geometry.paths.map((path) => (
          <path
            key={path}
            d={path}
            className="stroke-green-40"
            strokeWidth={2.5}
            strokeLinejoin="round"
            strokeLinecap="round"
            fill="none"
            vectorEffect="non-scaling-stroke"
          />
        ))}
      </svg>
      {geometry.peak && (
        <BiosignalPeakMarker
          className="absolute -translate-x-1/2 -translate-y-1/2"
          // 최고점 시각은 곡선과 따로 오므로 가장자리에 붙어도 표시가 잘리지 않게 안쪽으로 당깁니다.
          style={{
            left: `clamp(${PEAK_EDGE_PX}px, ${geometry.peak.leftPct}%, calc(100% - ${PEAK_EDGE_PX}px))`,
            top: geometry.peak.top,
          }}
        />
      )}
    </div>
    <div className="mt-2 h-5 relative" aria-hidden="true">
      {geometry.labels.map((regionLabel) => (
        <span
          key={regionLabel.key}
          className="absolute overflow-hidden text-center text-caption font-medium whitespace-nowrap text-label-alternative"
          style={{ left: `${regionLabel.leftPct}%`, width: `${regionLabel.widthPct}%` }}
        >
          {regionLabel.text}
        </span>
      ))}
    </div>
  </figure>
)
