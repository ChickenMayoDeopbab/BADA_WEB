import { describe, expect, it } from 'vitest'
import { buildBiosignalSummary } from './biosignalSummary'
import type { BiosignalReportView } from './types'

const view: BiosignalReportView = {
  heart: {
    chart: {
      binSec: 5,
      startSec: -5,
      values: [72, 80, 90],
      phases: ['anticipation', 'listen', 'speak'],
    },
    callChange: '통화하는 동안 심박이 평소보다 조금 빨랐어요.',
    peak: { atSec: 47, phase: 'speak', bpm: 94 },
    recoveryPct: 72,
    sentence: null,
    baselineBpm: 72.2,
  },
  eda: { chart: null, callChangePct: 22.6, risesPerMin: 2.4 },
  skinTemp: { callMeanC: 33.12, callDeltaC: 0.24 },
}

describe('buildBiosignalSummary', () => {
  it('심박 흐름과 주요 지표를 한 줄씩 고르고 절대 bpm은 넣지 않는다', () => {
    const summary = buildBiosignalSummary(view)

    expect(summary?.callChange).toBe('통화하는 동안 심박이 평소보다 조금 빨랐어요.')
    expect(summary?.rows).toEqual([
      { label: '가장 높았던 순간', value: '0:47 · 내가 말할 때', hasMarker: true },
      { label: '끊고 1분 동안', value: '평소 쪽으로 72% 돌아왔어요' },
      { label: '피부전도', value: '통화 중 평소 대비 +23%' },
      { label: '손목 피부 온도', value: '통화 중 평균 33.1°C' },
    ])
    expect(JSON.stringify(summary?.rows)).not.toContain('bpm')
  })

  it('없는 지표는 빼고, 고를 값이 하나도 없으면 null이다', () => {
    expect(buildBiosignalSummary({ ...view, eda: null, skinTemp: null })?.rows).toHaveLength(2)
    expect(
      buildBiosignalSummary({
        heart: null,
        eda: { chart: view.heart!.chart, callChangePct: null, risesPerMin: null },
        skinTemp: null,
      }),
    ).toBeNull()
    expect(buildBiosignalSummary(null)).toBeNull()
  })
})
