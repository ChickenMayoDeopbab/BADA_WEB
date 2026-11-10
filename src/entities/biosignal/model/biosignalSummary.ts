import { formatPeakMoment, formatSigned } from './biosignalReport'
import type { BiosignalChart, BiosignalPeak, BiosignalReportView } from './types'

export interface BiosignalSummaryRow {
  label: string
  value: string
  /** 곡선의 최고점 표시와 잇는 줄입니다. */
  hasMarker?: boolean
}

/** 대시보드용 요약입니다. 심박 흐름과 주요 지표 한 줄씩만 담습니다. */
export interface BiosignalSummary {
  callChange: string | null
  chart: BiosignalChart | null
  peak: BiosignalPeak | null
  rows: BiosignalSummaryRow[]
}

/**
 * 카드 내용에서 대시보드 요약을 고릅니다. 절대 bpm과 피부전도 곡선은 기록 상세에서만 봅니다.
 * 고를 값이 하나도 없으면 null입니다.
 */
export const buildBiosignalSummary = (
  view: BiosignalReportView | null,
): BiosignalSummary | null => {
  if (!view) return null
  const { heart, eda, skinTemp } = view
  const rows: BiosignalSummaryRow[] = []
  if (heart?.peak) {
    rows.push({
      label: '가장 높았던 순간',
      value: formatPeakMoment(heart.peak),
      hasMarker: heart.chart !== null,
    })
  }
  if (heart?.recoveryPct != null) {
    rows.push({ label: '끊고 1분 동안', value: `평소 쪽으로 ${heart.recoveryPct}% 돌아왔어요` })
  }
  if (eda?.callChangePct != null) {
    rows.push({
      label: '피부전도',
      value: `통화 중 평소 대비 ${formatSigned(eda.callChangePct, 0)}%`,
    })
  } else if (eda?.risesPerMin != null) {
    rows.push({
      label: '피부전도',
      value: `통화 중 1분에 ${eda.risesPerMin.toFixed(1)}번 올랐어요`,
    })
  }
  if (skinTemp?.callMeanC != null) {
    rows.push({ label: '손목 피부 온도', value: `통화 중 평균 ${skinTemp.callMeanC.toFixed(1)}°C` })
  } else if (skinTemp?.callDeltaC != null) {
    rows.push({
      label: '손목 피부 온도',
      value: `평소 대비 ${formatSigned(skinTemp.callDeltaC, 1)}°C`,
    })
  }
  const summary: BiosignalSummary = {
    callChange: heart?.callChange ?? null,
    chart: heart?.chart ?? null,
    peak: heart?.peak ?? null,
    rows,
  }

  return summary.callChange || summary.chart || rows.length > 0 ? summary : null
}
