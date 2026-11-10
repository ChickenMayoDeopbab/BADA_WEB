import type {
  BiosignalChart,
  BiosignalEdaView,
  BiosignalHeartView,
  BiosignalPeak,
  BiosignalPhase,
  BiosignalQuadrant,
  BiosignalReportResponse,
  BiosignalReportView,
  BiosignalSkinTempView,
  BiosignalValueMetric,
} from './types'

type BiosignalMetrics = NonNullable<BiosignalReportResponse['metrics']>

/** 통화 중 평균이 기준선과 이만큼 안쪽으로 차이 나면 '평소와 비슷했어요'로 말합니다(bpm). */
const SIMILAR_DELTA_BPM = 3
/** 이만큼 넘게 빨랐으면 '조금'을 뺍니다(bpm). 서버가 턴을 '몸 반응 큼'으로 보는 기준과 같습니다. */
const FASTER_DELTA_BPM = 10
/** 통화 칸 중 값이 있는 칸이 이 비율보다 적으면 곡선을 숨깁니다. 서버의 MIN_COVERAGE와 같습니다. */
const MIN_CALL_BIN_RATIO = 0.5

/** 칸별 문장입니다. 몸 반응이 작은 칸은 기존 음성 피드백만 쓰므로 문장이 없습니다. */
const QUADRANT_SENTENCES: Partial<Record<BiosignalQuadrant, string>> = {
  body_high_voice_steady: '몸은 반응했지만 목소리는 끝까지 안정적이었어요.',
  body_high_voice_shaky:
    '몸이 크게 반응한 순간이었어요. 이런 반응은 몸이 준비하는 자연스러운 신호예요.',
}

const isFiniteNumber = (value: unknown): value is number =>
  typeof value === 'number' && Number.isFinite(value)

/** MEASURED이고 값이 숫자일 때만 값을 돌려줍니다. */
const measuredValue = (metric: BiosignalValueMetric | undefined) =>
  metric?.status === 'MEASURED' && isFiniteNumber(metric.value) ? metric.value : null

const isCallPhase = (phase: BiosignalPhase | null) => phase === 'listen' || phase === 'speak'

/** 기준선 대비 통화 중 변화를 마음 상태를 단정하지 않는 문장으로 바꿉니다. */
const describeCallDelta = (delta: number) => {
  if (Math.abs(delta) < SIMILAR_DELTA_BPM) return '통화하는 동안 심박이 평소와 비슷했어요.'
  if (delta < 0) return '통화하는 동안 심박이 평소보다 조금 느렸어요.'
  if (delta < FASTER_DELTA_BPM) return '통화하는 동안 심박이 평소보다 조금 빨랐어요.'
  return '통화하는 동안 심박이 평소보다 빨랐어요.'
}

/**
 * 곡선을 만듭니다. 그릴 점이 두 개 미만이거나 값이 있는 통화 칸이 절반보다 적으면 숨깁니다.
 * 손을 움직이며 통화하면 서버가 그 구간 값을 버려 통화 칸이 거의 비는데, 끊긴 점만 남은 곡선은 오류처럼 보입니다.
 */
const toChart = (
  timeline: { bin_sec?: unknown; start_sec?: unknown; phase?: unknown } | undefined,
  rawValues: unknown,
): BiosignalChart | null => {
  if (
    !timeline ||
    !isFiniteNumber(timeline.bin_sec) ||
    timeline.bin_sec <= 0 ||
    !isFiniteNumber(timeline.start_sec) ||
    !Array.isArray(rawValues)
  ) {
    return null
  }
  const values = rawValues.map((value) => (isFiniteNumber(value) && value > 0 ? value : null))
  if (values.filter((value) => value !== null).length < 2) return null

  const rawPhases: unknown[] = Array.isArray(timeline.phase) ? timeline.phase : []
  const phases = values.map((_, index) => {
    const phase = rawPhases[index]
    return typeof phase === 'string' ? (phase as BiosignalPhase) : null
  })
  const callValues = values.filter((_, index) => isCallPhase(phases[index]))
  const filledCallCount = callValues.filter((value) => value !== null).length
  if (callValues.length === 0 || filledCallCount < callValues.length * MIN_CALL_BIN_RATIO) {
    return null
  }

  return { binSec: timeline.bin_sec, startSec: timeline.start_sec, values, phases }
}

const toPeak = (
  rawPeak: NonNullable<NonNullable<BiosignalMetrics['cardiac']>['hr']>['peak'],
): BiosignalPeak | null =>
  rawPeak?.status === 'MEASURED' &&
  isFiniteNumber(rawPeak.bpm) &&
  isFiniteNumber(rawPeak.at_sec) &&
  rawPeak.at_sec >= 0
    ? {
        atSec: rawPeak.at_sec,
        phase: rawPeak.phase === 'listen' || rawPeak.phase === 'speak' ? rawPeak.phase : null,
        bpm: rawPeak.bpm,
      }
    : null

/** 칭찬할 턴이 있으면 그 문장을, 없으면 가장 높았던 순간의 턴 문장을 고릅니다. */
const pickSentence = (fusion: BiosignalMetrics['fusion'], peakTurn: number | null) => {
  const turn = isFiniteNumber(fusion?.praise_turn) ? fusion.praise_turn : peakTurn
  if (turn === null || !Array.isArray(fusion?.turns)) return null
  const quadrant = fusion.turns.find((entry) => entry?.turn === turn)?.quadrant

  return quadrant ? (QUADRANT_SENTENCES[quadrant] ?? null) : null
}

/** 기준선이 없으면 '평소' 비교(통화 중 변화·회복·평소 심박)를 모두 뺍니다. */
const buildHeartView = (metrics: BiosignalMetrics): BiosignalHeartView | null => {
  const cardiac = metrics.cardiac
  const baseline = cardiac?.baseline
  const baselineBpm =
    baseline?.source === 'rest' || baseline?.source === 'previous_sessions'
      ? measuredValue(baseline)
      : null
  const hasBaseline = baselineBpm !== null

  const callDelta = hasBaseline ? measuredValue(cardiac?.hr?.call_delta) : null
  const rawPeak = cardiac?.hr?.peak
  const peak = toPeak(rawPeak)
  const recovery = hasBaseline ? measuredValue(cardiac?.hr?.recovery_pct) : null
  // 돌아오지 않은 회차를 '0%'로 말하면 진척이 없다는 말처럼 들리므로 숨깁니다.
  const recoveryPct =
    recovery !== null && Math.round(recovery) > 0 ? Math.min(100, Math.round(recovery)) : null
  const peakTurn = peak && isFiniteNumber(rawPeak?.turn) ? rawPeak.turn : null

  const view: BiosignalHeartView = {
    chart: toChart(cardiac?.report_timeline, cardiac?.report_timeline?.hr),
    callChange: callDelta === null ? null : describeCallDelta(callDelta),
    peak,
    recoveryPct,
    sentence: pickSentence(metrics.fusion, peakTurn),
    baselineBpm,
  }
  const hasContent =
    view.chart !== null ||
    view.callChange !== null ||
    view.peak !== null ||
    view.recoveryPct !== null ||
    view.sentence !== null

  return hasContent ? view : null
}

/** 피부전도 센서가 없는 워치(Galaxy Watch6 등)는 UNAVAILABLE이라 구역째 숨깁니다. */
const buildEdaView = (eda: BiosignalMetrics['eda']): BiosignalEdaView | null => {
  if (eda?.status !== 'MEASURED') return null
  const rises = eda.rises?.call
  const view: BiosignalEdaView = {
    chart: toChart(eda.report_timeline, eda.report_timeline?.eda),
    callChangePct: measuredValue(eda.change_vs_baseline_pct?.call),
    risesPerMin:
      rises?.status === 'MEASURED' && isFiniteNumber(rises.per_min) ? rises.per_min : null,
  }

  return view.chart !== null || view.callChangePct !== null || view.risesPerMin !== null
    ? view
    : null
}

/** 손목 피부 온도는 약 1분에 1개라 통화가 짧으면 값이 없습니다. */
const buildSkinTempView = (
  skinTemp: BiosignalMetrics['skin_temp'],
): BiosignalSkinTempView | null => {
  if (skinTemp?.status !== 'MEASURED') return null
  const view: BiosignalSkinTempView = {
    callMeanC: measuredValue(skinTemp.means?.call),
    callDeltaC: measuredValue(skinTemp.delta_vs_baseline_c?.call),
  }

  return view.callMeanC !== null || view.callDeltaC !== null ? view : null
}

/** 분석 결과를 '몸의 반응' 카드 내용으로 바꿉니다. 분석 전이거나 보여 줄 값이 없으면 null입니다. */
export const buildBiosignalReportView = (
  report: BiosignalReportResponse | null | undefined,
): BiosignalReportView | null => {
  if (report?.status !== 'ANALYZED' || !report.metrics) return null
  const view: BiosignalReportView = {
    heart: buildHeartView(report.metrics),
    eda: buildEdaView(report.metrics.eda),
    skinTemp: buildSkinTempView(report.metrics.skin_temp),
  }

  return view.heart || view.eda || view.skinTemp ? view : null
}

/** 통화 시작 기준 초를 M:SS로 바꿉니다. */
export const formatCallSecond = (seconds: number) => {
  const total = Math.max(0, Math.round(seconds))

  return `${Math.floor(total / 60)}:${String(total % 60).padStart(2, '0')}`
}

/** 부호를 붙인 숫자를 만듭니다. 0은 부호 없이 적습니다. */
export const formatSigned = (value: number, digits: number) => {
  const rounded = Number(value.toFixed(digits))
  if (rounded === 0) return (0).toFixed(digits)

  return `${rounded > 0 ? '+' : '−'}${Math.abs(rounded).toFixed(digits)}`
}
