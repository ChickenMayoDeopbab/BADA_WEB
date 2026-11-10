import type { BiosignalChart, BiosignalPeak, BiosignalPhase } from './types'

export const BIOSIGNAL_CHART_HEIGHT = 120
const CHART_PADDING_Y = 12
/** 구간이 곡선 폭의 이 비율보다 좁으면 이름이 옆 구간 이름과 겹치므로 적지 않습니다. */
const MIN_LABEL_RATIO = 0.14
/** 심박 곡선 세로 눈금의 최소 폭(bpm)입니다. */
const HEART_MIN_SPAN_BPM = 10
/** 피부전도 곡선 세로 눈금의 최소 폭입니다. 사람마다 수준이 크게 달라 가운데 값 대비 비율로 둡니다. */
const EDA_MIN_SPAN_RATIO = 0.2

type BiosignalRegion = 'before' | 'call' | 'after'

const REGION_LABELS: Record<BiosignalRegion, string> = {
  before: '통화 전',
  call: '통화 중',
  after: '통화 후',
}

const toRegion = (phase: BiosignalPhase | null): BiosignalRegion | null => {
  if (phase === 'baseline' || phase === 'anticipation') return 'before'
  if (phase === 'listen' || phase === 'speak') return 'call'
  if (phase === 'recovery') return 'after'
  return null
}

/** 이어진 같은 단계 칸을 [시작 칸, 끝 칸) 묶음으로 만듭니다. */
const groupRegions = (phases: (BiosignalPhase | null)[]) => {
  const groups: { region: BiosignalRegion; start: number; end: number }[] = []
  phases.forEach((phase, index) => {
    const region = toRegion(phase)
    if (!region) return
    const last = groups.at(-1)
    if (last && last.region === region && last.end === index) last.end = index + 1
    else groups.push({ region, start: index, end: index + 1 })
  })
  return groups
}

/** 빈 칸(null)에서 선을 끊습니다. 이어 그리면 없는 급등이 생겨 거짓 변화로 읽힙니다. */
const buildSegments = (points: ({ x: number; y: number } | null)[]) => {
  const segments: { x: number; y: number }[][] = []
  let current: { x: number; y: number }[] = []
  points.forEach((point) => {
    if (point) {
      current.push(point)
      return
    }
    if (current.length > 0) segments.push(current)
    current = []
  })
  if (current.length > 0) segments.push(current)
  return segments
}

export interface BiosignalChartGeometry {
  /** viewBox 폭입니다. 칸 하나가 1입니다. */
  width: number
  /** 선 조각마다 그릴 경로입니다. 점 하나뿐인 조각은 길이 0 경로라 둥근 끝으로 점이 찍힙니다. */
  paths: string[]
  /** 구간이 바뀌는 곳(벨, 통화 시작, 끊음)의 x입니다. */
  boundaries: number[]
  labels: { key: string; text: string; leftPct: number; widthPct: number }[]
  /** 최고점 위치입니다. 가로는 곡선 폭 대비 %, 세로는 px입니다. */
  peak: { leftPct: number; top: number } | null
}

/** 곡선을 SVG 좌표로 바꿉니다. 가로는 칸 단위로 늘이고 세로는 px 그대로 씁니다. */
export const buildBiosignalChartGeometry = (
  chart: BiosignalChart,
  {
    minSpan = 0,
    minSpanRatio = 0,
    peak,
  }: {
    /** 세로 눈금의 최소 폭(값 단위) */
    minSpan?: number
    /** 세로 눈금의 최소 폭(가운데 값 대비 비율). 단위가 사람마다 크게 다른 신호에 씁니다. */
    minSpanRatio?: number
    peak?: { atSec: number; value: number } | null
  },
): BiosignalChartGeometry => {
  const values = chart.values.filter((value): value is number => value !== null)
  if (peak) values.push(peak.value)
  const lowest = Math.min(...values)
  const highest = Math.max(...values)
  const middle = (lowest + highest) / 2
  // 값이 거의 같아도 선이 납작하게 위아래로 붙지 않게 최소 폭을 둡니다.
  const half = Math.max(minSpan, minSpanRatio * Math.abs(middle), highest - lowest, 1e-6) / 2
  const minValue = middle - half
  const maxValue = middle + half
  const yOf = (value: number) =>
    CHART_PADDING_Y +
    ((maxValue - value) / (maxValue - minValue)) * (BIOSIGNAL_CHART_HEIGHT - CHART_PADDING_Y * 2)

  const width = chart.values.length
  const totalSec = width * chart.binSec
  const regions = groupRegions(chart.phases)
  const paths = buildSegments(
    chart.values.map((value, index) => (value === null ? null : { x: index + 0.5, y: yOf(value) })),
  ).map((segment) => {
    const [first, ...rest] = segment
    const tail = rest.length > 0 ? rest : [first]
    return `M${first.x} ${first.y} ${tail.map((point) => `L${point.x} ${point.y}`).join(' ')}`
  })
  // 단계마다 가장 넓은 구간 하나에만 이름을 적습니다.
  const labels = (Object.keys(REGION_LABELS) as BiosignalRegion[]).flatMap((region) => {
    const widest = regions
      .filter((group) => group.region === region)
      .sort((first, second) => second.end - second.start - (first.end - first.start))[0]
    if (!widest || (widest.end - widest.start) / width < MIN_LABEL_RATIO) return []
    return [
      {
        key: region,
        text: REGION_LABELS[region],
        leftPct: (widest.start / width) * 100,
        widthPct: ((widest.end - widest.start) / width) * 100,
      },
    ]
  })

  return {
    width,
    paths,
    boundaries: regions.slice(1).map((group) => group.start),
    labels,
    peak: peak
      ? {
          leftPct: Math.min(100, Math.max(0, ((peak.atSec - chart.startSec) / totalSec) * 100)),
          top: yOf(peak.value),
        }
      : null,
  }
}

/** 심박 곡선 좌표입니다. 최고점을 세로 범위에 넣습니다. */
export const buildHeartChartGeometry = (chart: BiosignalChart, peak: BiosignalPeak | null) =>
  buildBiosignalChartGeometry(chart, {
    minSpan: HEART_MIN_SPAN_BPM,
    peak: peak && { atSec: peak.atSec, value: peak.bpm },
  })

/** 피부전도 곡선 좌표입니다. */
export const buildEdaChartGeometry = (chart: BiosignalChart) =>
  buildBiosignalChartGeometry(chart, { minSpanRatio: EDA_MIN_SPAN_RATIO })
