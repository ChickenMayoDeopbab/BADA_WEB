import { describe, expect, it } from 'vitest'
import { buildBiosignalChartGeometry } from './biosignalChart'
import type { BiosignalChart } from './types'

const chart: BiosignalChart = {
  binSec: 5,
  startSec: -10,
  values: [70, 72, null, 80, 90, 88, 84, 76, 74, 72],
  phases: [
    'anticipation',
    'anticipation',
    'listen',
    'listen',
    'speak',
    'speak',
    'listen',
    'recovery',
    'recovery',
    'recovery',
  ],
}

describe('buildBiosignalChartGeometry', () => {
  it('빈 칸에서 선을 끊고 이어 그리지 않는다', () => {
    const geometry = buildBiosignalChartGeometry(chart, { minSpan: 10 })

    expect(geometry.width).toBe(10)
    expect(geometry.paths).toHaveLength(2)
    expect(geometry.paths[0]).toMatch(/^M0\.5 [\d.]+ L1\.5 [\d.]+$/)
    expect(geometry.paths[1]).toMatch(/^M3\.5 /)
  })

  it('점 하나뿐인 조각도 길이 0 경로로 남긴다', () => {
    const geometry = buildBiosignalChartGeometry(
      { ...chart, values: [70, null, 80, 82, null, null, null, null, null, null] },
      { minSpan: 10 },
    )

    expect(geometry.paths[0]).toMatch(/^M0\.5 ([\d.]+) L0\.5 \1$/)
  })

  it('구간 경계에 점선 위치를 두고 좁은 구간은 이름을 적지 않는다', () => {
    const geometry = buildBiosignalChartGeometry(chart, { minSpan: 10 })

    expect(geometry.boundaries).toEqual([2, 7])
    expect(geometry.labels.map((label) => label.text)).toEqual(['통화 전', '통화 중', '통화 후'])
    expect(geometry.labels[1]).toMatchObject({ leftPct: 20, widthPct: 50 })

    const longCall = buildBiosignalChartGeometry(
      {
        ...chart,
        values: Array.from({ length: 20 }, () => 80),
        phases: ['anticipation', ...Array.from({ length: 19 }, () => 'listen' as const)],
      },
      { minSpan: 10 },
    )
    expect(longCall.labels.map((label) => label.text)).toEqual(['통화 중'])
  })

  it('최고점을 통화 시작 기준 초 위치에 두고 세로 범위에 포함한다', () => {
    const geometry = buildBiosignalChartGeometry(chart, {
      minSpan: 10,
      peak: { atSec: 15, value: 95 },
    })

    // (15 − (−10)) / 50초 = 50%
    expect(geometry.peak?.leftPct).toBe(50)
    // 가장 큰 값이라 위쪽 여백(12px)에 닿습니다.
    expect(geometry.peak?.top).toBeCloseTo(12)
  })
})
