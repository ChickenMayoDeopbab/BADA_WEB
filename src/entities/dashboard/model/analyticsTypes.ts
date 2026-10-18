export type DashboardSessionType = 'SCENARIO' | 'CUSTOM'
export type DashboardPersonality = 'KIND' | 'NORMAL' | 'TOUGH' | 'RUDE'
export type DashboardInterval = 'DAY' | 'WEEK'
export type DashboardStatus = 'READY' | 'INSUFFICIENT_DATA' | 'NO_DATA' | 'NOT_COMPARABLE'
export type DashboardMetricKey =
  | 'selfReportedAnxiety'
  | 'tremorTurnRate'
  | 'longPauseTurnRate'
  | 'quietDropTurnRate'
  | 'fastRateTurnRate'
  | 'responseDelayMs'

export interface DashboardFilters {
  sessionType?: DashboardSessionType
  scenarioId?: number
  scenarioVersion?: string
  difficulty?: string
  aiPersonality?: DashboardPersonality
  scriptLevel?: number
}

export interface DashboardQuery extends DashboardFilters {
  from: string
  to: string
  interval?: DashboardInterval
}

export interface DashboardComparisonQuery extends DashboardQuery {
  baselineFrom?: string
  baselineTo?: string
}

export interface DashboardScenariosQuery extends DashboardComparisonQuery {
  page?: number
  size?: number
  includeSeries?: boolean
}

export interface DashboardPeriod {
  from: string
  to: string
  isPartial: boolean
}

export interface DashboardMeta {
  period: DashboardPeriod
  baseline: DashboardPeriod | null
  interval: DashboardInterval
  filters: DashboardCondition
  timeZone: string
  generatedAt: string
  aggregationPolicyVersion: string
}

export interface DashboardSummary {
  trainingCount: number
  trainingDays: number
  totalDurationSeconds: number
  warmupCount: number
}

export interface DashboardMetricValue {
  value: number | null
  unit: string
  aggregation: string
  sampleCount: number
  eligibleTurnCount: number
  status: DashboardStatus
  exclusionReasons: Record<string, number>
}

export type DashboardMetricValues = Record<DashboardMetricKey, DashboardMetricValue>

export interface DashboardSeriesPoint {
  from: string
  to: string
  isPartial: boolean
  trainingCount: number
  metrics: DashboardMetricValues
}

export interface DashboardOverview {
  meta: DashboardMeta
  summary: DashboardSummary
  experience: {
    scenarioCount: number
    newScenarioCount: number
    unknownScenarioTrainingCount: number
  }
  hintSettings: Record<string, number>
  metrics: DashboardMetricValues
  series: DashboardSeriesPoint[]
  activity: Array<{ date: string; trainingCount: number }>
  coverage: {
    trainingCount: number
    selfReportCount: number
    metricSampleCounts: Record<DashboardMetricKey, number>
  }
}

export interface DashboardCondition {
  sessionType: DashboardSessionType | null
  scenarioId: number | null
  scenarioVersion: string | null
  difficulty: string | null
  aiPersonality: DashboardPersonality | null
  scriptLevel: number | null
}

export interface DashboardConditionCount {
  condition: DashboardCondition
  trainingCount: number
}

export interface DashboardPeriodComparison {
  baseline: DashboardMetricValue
  current: DashboardMetricValue
  delta: number | null
  status: DashboardStatus
}

export interface DashboardMetricComparison {
  key: DashboardMetricKey
  unit: string
  deltaUnit: string
  overall: DashboardPeriodComparison
  matched: DashboardPeriodComparison & {
    conditionCount: number
    conditions: Array<{
      condition: DashboardCondition
      baselineSampleCount: number
      currentSampleCount: number
      weight: number
      baselineValue: number
      currentValue: number
    }>
  }
}

export interface DashboardComparisonSeriesPoint {
  from: string
  to: string
  isPartial: boolean
  trainingCount: number
  matchedTrainingCounts: Record<DashboardMetricKey, number>
}

export interface DashboardComparison {
  meta: DashboardMeta
  baselineSummary: DashboardSummary
  currentSummary: DashboardSummary
  metrics: DashboardMetricComparison[]
  baselineConditions: DashboardConditionCount[]
  currentConditions: DashboardConditionCount[]
  baselineSeries: DashboardComparisonSeriesPoint[]
  currentSeries: DashboardComparisonSeriesPoint[]
}

export interface DashboardScenario {
  scenarioId: number
  sessionType: DashboardSessionType
  scenarioName: string
  summary: DashboardSummary
  firstTrainedAt: string | null
  lastTrainedAt: string
  conditionBreakdown: DashboardConditionCount[]
  metrics: DashboardMetricValues
  comparison: DashboardMetricComparison[]
  series: DashboardSeriesPoint[]
}

export interface DashboardScenarios {
  meta: DashboardMeta
  items: DashboardScenario[]
  page: number
  size: number
  totalElements: number
  totalPages: number
}
