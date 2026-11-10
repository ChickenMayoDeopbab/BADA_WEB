export type BiosignalReportStatus = 'AWAITING_DATA' | 'ANALYZED' | 'EXPIRED' | 'REJECTED'

/** 기준선 출처입니다. none이면 '평소'와 비교하지 않습니다. */
export type BiosignalBaselineSource = 'rest' | 'previous_sessions' | 'none'

/** 지표마다 붙는 측정 상태입니다. MEASURED일 때만 화면에 사용합니다. */
export type BiosignalMetricStatus = 'MEASURED' | 'INSUFFICIENT_DATA' | 'UNAVAILABLE'

/** 곡선 칸의 단계입니다. baseline은 휴식, anticipation은 벨이 울린 뒤 받기 전입니다. */
export type BiosignalPhase = 'baseline' | 'anticipation' | 'listen' | 'speak' | 'recovery'

/** 턴별 몸 반응(심박)과 목소리 흔들림을 묶은 칸입니다. */
export type BiosignalQuadrant =
  | 'body_high_voice_steady'
  | 'body_high_voice_shaky'
  | 'body_low_voice_steady'
  | 'body_low_voice_shaky'

export interface BiosignalValueMetric {
  status: BiosignalMetricStatus
  value?: number | null
}

/** 통화 시작 기준 bin_sec 간격 중앙값입니다. null 칸은 품질이 낮아 비운 구간입니다. */
interface BiosignalTimelineBase {
  bin_sec: number
  start_sec: number
  phase: (BiosignalPhase | null)[]
}

export interface BiosignalHeartRateTimeline extends BiosignalTimelineBase {
  hr: (number | null)[]
}

export interface BiosignalEdaTimeline extends BiosignalTimelineBase {
  eda: (number | null)[]
}

/** 생체신호 분석 조회 응답입니다. metrics는 화면에서 쓰는 필드만 적습니다. */
export interface BiosignalReportResponse {
  session_id: string
  status: BiosignalReportStatus
  source?: string
  analyzed_at?: string
  metrics?: {
    cardiac?: {
      baseline?: BiosignalValueMetric & { source?: BiosignalBaselineSource }
      hr?: {
        /** 통화 중 평균 − 기준선(bpm) */
        call_delta?: BiosignalValueMetric
        peak?: {
          status: BiosignalMetricStatus
          bpm?: number | null
          delta?: number | null
          /** 통화 시작 기준 초 */
          at_sec?: number | null
          phase?: 'listen' | 'speak' | null
          turn?: number | null
        }
        /** 끊고 1분 동안 기준선 쪽으로 돌아온 비율(%) */
        recovery_pct?: BiosignalValueMetric
      }
      report_timeline?: BiosignalHeartRateTimeline
    }
    eda?: {
      status: BiosignalMetricStatus
      change_vs_baseline_pct?: { call?: BiosignalValueMetric }
      rises?: { call?: { status: BiosignalMetricStatus; count?: number; per_min?: number | null } }
      report_timeline?: BiosignalEdaTimeline
    }
    skin_temp?: {
      status: BiosignalMetricStatus
      means?: { call?: BiosignalValueMetric }
      delta_vs_baseline_c?: { call?: BiosignalValueMetric }
    }
    fusion?: {
      /** 몸은 반응했지만 목소리가 안정적이었던 턴 */
      praise_turn?: number | null
      turns?: { turn: number; quadrant: BiosignalQuadrant | null }[]
    }
  }
}

/** 화면에 그릴 곡선입니다. null 칸에서 선을 끊습니다. */
export interface BiosignalChart {
  binSec: number
  /** 통화 시작 기준 초 */
  startSec: number
  values: (number | null)[]
  phases: (BiosignalPhase | null)[]
}

export interface BiosignalPeak {
  /** 통화 시작 기준 초 */
  atSec: number
  phase: 'listen' | 'speak' | null
  bpm: number
}

export interface BiosignalHeartView {
  chart: BiosignalChart | null
  /** 기준선 대비 통화 중 변화 문장 */
  callChange: string | null
  peak: BiosignalPeak | null
  /** 0 초과 100 이하 정수 */
  recoveryPct: number | null
  /** 턴 칸별 문장 */
  sentence: string | null
  /** 펼쳐야 보이는 평소 심박 */
  baselineBpm: number | null
}

export interface BiosignalEdaView {
  chart: BiosignalChart | null
  /** 평소 대비 통화 중 변화율(%) */
  callChangePct: number | null
  /** 통화 중 1분당 오름 횟수 */
  risesPerMin: number | null
}

export interface BiosignalSkinTempView {
  /** 통화 중 평균(°C) */
  callMeanC: number | null
  /** 평소 대비 통화 중 차이(°C) */
  callDeltaC: number | null
}

/** '몸의 반응' 카드 내용입니다. 값이 없는 구역은 null입니다. */
export interface BiosignalReportView {
  heart: BiosignalHeartView | null
  eda: BiosignalEdaView | null
  skinTemp: BiosignalSkinTempView | null
}

/** 회차 추세 응답입니다. 최근 분석 회차를 찾는 데 쓰는 필드만 적습니다(워밍업 제외). */
export interface BiosignalTrendResponse {
  sessions?: number
  groups?: { sessions?: { session_id?: string; at?: string }[] }[]
}

/** 가장 최근에 분석된 통화입니다. */
export interface BiosignalLatestSession {
  sessionId: string
  /** 분석 행이 만들어진 시각(ISO) */
  at: string
}
