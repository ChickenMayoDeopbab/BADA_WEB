type Phase = 'baseline' | 'anticipation' | 'listen' | 'speak' | 'recovery'

/** 휴식 60초, 벨 10초, 통화 150초, 회복 60초를 5초 칸으로 나눈 단계입니다. */
const phaseRuns: [Phase, number][] = [
  ['baseline', 12],
  ['anticipation', 2],
  ['listen', 3],
  ['speak', 3],
  ['listen', 2],
  ['speak', 4],
  ['listen', 4],
  ['speak', 5],
  ['listen', 4],
  ['speak', 5],
  ['recovery', 12],
]
const phases = phaseRuns.flatMap(([phase, count]) => Array.from({ length: count }, () => phase))

// 손을 움직인 칸은 서버가 비워 둡니다(null).
const hr = [
  ...[72, 71, 73, 72, 72, 71, 73, 72, 72, 73, 71, 72],
  ...[76, 79],
  ...[80, 82, 81, 84, 86, 85, 83, null, 88, 94, 91, 87, 84, 82, null, 81],
  ...[83, 84, 82, 81, 80, 79, 78, 79, 77, 79, 80, 78, 77, 76],
  ...[78, 77, 76, 76, 75, 75, 74, 75, 74, 74, 73, 74],
]
const eda = [
  ...[2.11, 2.12, 2.1, 2.13, 2.12, 2.11, 2.12, 2.14, 2.13, 2.12, 2.11, 2.12],
  ...[2.2, 2.31],
  ...[2.38, 2.44, 2.47, 2.58, 2.66, 2.62, 2.6, 2.64, 2.71, 2.79, 2.74, 2.7, 2.66, 2.63, 2.6, 2.58],
  ...[2.62, 2.65, 2.61, 2.58, 2.56, 2.55, 2.53, 2.52, 2.5, 2.52, 2.54, 2.51, 2.49, 2.47],
  ...[2.45, 2.42, 2.4, 2.37, 2.35, 2.33, 2.32, 2.3, 2.29, 2.28, 2.27, 2.26],
]

/** 서버 `GET /api/v1/biosignals/{sessionId}` 응답 형식의 예시입니다(Galaxy Watch8 기준). */
export const makeBiosignalReport = (sessionId: string) => ({
  session_id: sessionId,
  status: 'ANALYZED',
  source: 'samsung_sensor_sdk',
  analyzed_at: '2026-11-10T00:25:00Z',
  metrics: {
    cardiac: {
      baseline: { status: 'MEASURED', value: 72.2, source: 'rest' },
      hr: {
        call_delta: { status: 'MEASURED', value: 9.4 },
        peak: { status: 'MEASURED', bpm: 94, delta: 21.8, at_sec: 47, phase: 'speak', turn: 2 },
        recovery_pct: { status: 'MEASURED', value: 72.3, tail_bpm: 74.4 },
      },
      report_timeline: { bin_sec: 5, start_sec: -70, hr, phase: phases },
    },
    eda: {
      status: 'MEASURED',
      change_vs_baseline_pct: { call: { status: 'MEASURED', value: 22.6 } },
      rises: { call: { status: 'MEASURED', count: 6, per_min: 2.4 } },
      report_timeline: { bin_sec: 5, start_sec: -70, eda, phase: phases },
    },
    skin_temp: {
      status: 'MEASURED',
      means: { call: { status: 'MEASURED', value: 33.12 } },
      delta_vs_baseline_c: { call: { status: 'MEASURED', value: 0.24 } },
    },
    fusion: {
      praise_turn: 2,
      turns: [
        { turn: 1, quadrant: 'body_low_voice_steady' },
        { turn: 2, quadrant: 'body_high_voice_steady' },
      ],
    },
  },
})

/** 피부전도 센서가 없고 피부 온도 표본이 모자란 Galaxy Watch6 통화입니다. */
export const makeWatch6BiosignalReport = (sessionId: string) => {
  const report = makeBiosignalReport(sessionId)
  return {
    ...report,
    metrics: {
      ...report.metrics,
      eda: { status: 'UNAVAILABLE' },
      skin_temp: {
        status: 'MEASURED',
        means: { call: { status: 'INSUFFICIENT_DATA' } },
        delta_vs_baseline_c: { call: { status: 'INSUFFICIENT_DATA' } },
      },
    },
  }
}
