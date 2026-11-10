import { describe, expect, it } from 'vitest'
import { buildBiosignalReportView, formatCallSecond, formatSigned } from './biosignalReport'
import type { BiosignalPhase, BiosignalReportResponse } from './types'

const phases: BiosignalPhase[] = [
  'anticipation',
  'listen',
  'listen',
  'speak',
  'speak',
  'listen',
  'recovery',
  'recovery',
]

const createReport = (): BiosignalReportResponse => ({
  session_id: 'session-1',
  status: 'ANALYZED',
  source: 'samsung_sensor_sdk',
  analyzed_at: '2026-11-10T09:00:00Z',
  metrics: {
    cardiac: {
      baseline: { status: 'MEASURED', value: 72.4, source: 'rest' },
      hr: {
        call_delta: { status: 'MEASURED', value: 8.6 },
        peak: { status: 'MEASURED', bpm: 94.2, delta: 21.8, at_sec: 47, phase: 'speak', turn: 3 },
        recovery_pct: { status: 'MEASURED', value: 63.4 },
      },
      report_timeline: {
        bin_sec: 5,
        start_sec: -5,
        hr: [74, 80, null, 90, 94, 86, 80, 76],
        phase: phases,
      },
    },
    eda: {
      status: 'MEASURED',
      change_vs_baseline_pct: { call: { status: 'MEASURED', value: 12.4 } },
      rises: { call: { status: 'MEASURED', count: 5, per_min: 2.5 } },
      report_timeline: {
        bin_sec: 5,
        start_sec: -5,
        eda: [2.1, 2.2, 2.4, 2.6, 2.5, 2.4, 2.3, 2.2],
        phase: phases,
      },
    },
    skin_temp: {
      status: 'MEASURED',
      means: { call: { status: 'MEASURED', value: 33.12 } },
      delta_vs_baseline_c: { call: { status: 'MEASURED', value: 0.24 } },
    },
    fusion: {
      praise_turn: 3,
      turns: [{ turn: 3, quadrant: 'body_high_voice_steady' }],
    },
  },
})

const withCallDelta = (value: number) => {
  const report = createReport()
  report.metrics!.cardiac!.hr!.call_delta = { status: 'MEASURED', value }
  return buildBiosignalReportView(report)?.heart?.callChange
}

const withRecovery = (value: number) => {
  const report = createReport()
  report.metrics!.cardiac!.hr!.recovery_pct = { status: 'MEASURED', value }
  return buildBiosignalReportView(report)?.heart?.recoveryPct
}

describe('buildBiosignalReportView', () => {
  it('분석된 통화를 심박·피부전도·손목 피부 온도 카드 내용으로 바꾼다', () => {
    const view = buildBiosignalReportView(createReport())

    expect(view?.heart).toMatchObject({
      callChange: '통화하는 동안 심박이 평소보다 조금 빨랐어요.',
      peak: { atSec: 47, phase: 'speak', bpm: 94.2 },
      recoveryPct: 63,
      sentence: '몸은 반응했지만 목소리는 끝까지 안정적이었어요.',
      baselineBpm: 72.4,
    })
    expect(view?.heart?.chart?.values).toEqual([74, 80, null, 90, 94, 86, 80, 76])
    expect(view?.eda).toMatchObject({ callChangePct: 12.4, risesPerMin: 2.5 })
    expect(view?.eda?.chart).not.toBeNull()
    expect(view?.skinTemp).toEqual({ callMeanC: 33.12, callDeltaC: 0.24 })
  })

  it('기준선이 없으면 평소 비교(통화 중 변화·회복·평소 심박)를 모두 뺀다', () => {
    const report = createReport()
    report.metrics!.cardiac!.baseline = { status: 'MEASURED', value: 72, source: 'none' }

    const heart = buildBiosignalReportView(report)?.heart

    expect(heart).toMatchObject({ callChange: null, recoveryPct: null, baselineBpm: null })
    expect(heart?.peak).not.toBeNull()
    expect(heart?.chart).not.toBeNull()
  })

  it('통화 중 변화를 3·10bpm 기준으로 단정하지 않는 문장으로 바꾼다', () => {
    expect(withCallDelta(2.9)).toBe('통화하는 동안 심박이 평소와 비슷했어요.')
    expect(withCallDelta(-2.9)).toBe('통화하는 동안 심박이 평소와 비슷했어요.')
    expect(withCallDelta(-5)).toBe('통화하는 동안 심박이 평소보다 조금 느렸어요.')
    expect(withCallDelta(9.9)).toBe('통화하는 동안 심박이 평소보다 조금 빨랐어요.')
    expect(withCallDelta(10)).toBe('통화하는 동안 심박이 평소보다 빨랐어요.')
  })

  it('회복률은 반올림해 100으로 자르고 0 이하는 숨긴다', () => {
    expect(withRecovery(120)).toBe(100)
    expect(withRecovery(99.6)).toBe(100)
    expect(withRecovery(0.4)).toBeNull()
    expect(withRecovery(-12)).toBeNull()
  })

  it('MEASURED가 아닌 지표는 숨긴다', () => {
    const report = createReport()
    report.metrics!.cardiac!.hr!.call_delta = { status: 'INSUFFICIENT_DATA' }
    report.metrics!.cardiac!.hr!.peak = { status: 'INSUFFICIENT_DATA' }
    report.metrics!.eda!.rises = { call: { status: 'INSUFFICIENT_DATA' } }

    const view = buildBiosignalReportView(report)

    expect(view?.heart).toMatchObject({ callChange: null, peak: null })
    expect(view?.eda?.risesPerMin).toBeNull()
  })

  it('그릴 점이 2개 미만이거나 값이 있는 통화 칸이 절반 미만이면 곡선을 숨긴다', () => {
    const sparse = createReport()
    sparse.metrics!.cardiac!.report_timeline!.hr = [74, null, null, null, null, null, null, null]
    const motion = createReport()
    // 통화 칸 5개 중 2개만 값이 있습니다.
    motion.metrics!.cardiac!.report_timeline!.hr = [74, 80, null, null, null, 86, 80, 76]

    expect(buildBiosignalReportView(sparse)?.heart?.chart).toBeNull()
    expect(buildBiosignalReportView(motion)?.heart?.chart).toBeNull()
  })

  it('피부전도 센서가 없고 피부 온도가 모자라면(Watch6) 그 구역만 숨긴다', () => {
    const report = createReport()
    report.metrics!.eda = { status: 'UNAVAILABLE' }
    report.metrics!.skin_temp = {
      status: 'MEASURED',
      means: { call: { status: 'INSUFFICIENT_DATA' } },
      delta_vs_baseline_c: { call: { status: 'INSUFFICIENT_DATA' } },
    }

    const view = buildBiosignalReportView(report)

    expect(view?.heart).not.toBeNull()
    expect(view?.eda).toBeNull()
    expect(view?.skinTemp).toBeNull()
  })

  it('분석 전이거나 보여 줄 값이 하나도 없으면 null이다', () => {
    const empty = createReport()
    empty.metrics = {
      cardiac: { baseline: { status: 'UNAVAILABLE', source: 'none' } },
      eda: { status: 'UNAVAILABLE' },
      skin_temp: { status: 'UNAVAILABLE' },
    }

    expect(
      buildBiosignalReportView({ session_id: 'session-1', status: 'AWAITING_DATA' }),
    ).toBeNull()
    expect(buildBiosignalReportView(empty)).toBeNull()
    expect(buildBiosignalReportView(undefined)).toBeNull()
  })
})

describe('biosignal formatters', () => {
  it('통화 시작 기준 초를 M:SS로 바꾼다', () => {
    expect(formatCallSecond(47)).toBe('0:47')
    expect(formatCallSecond(125.4)).toBe('2:05')
    expect(formatCallSecond(-3)).toBe('0:00')
  })

  it('부호를 붙이고 0은 부호 없이 적는다', () => {
    expect(formatSigned(12.4, 0)).toBe('+12')
    expect(formatSigned(-0.24, 1)).toBe('−0.2')
    expect(formatSigned(0.04, 1)).toBe('0.0')
  })
})
