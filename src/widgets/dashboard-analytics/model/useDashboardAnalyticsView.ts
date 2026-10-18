import { useState, type FormEvent } from 'react'
import {
  useDashboardComparison,
  useDashboardOverview,
  useDashboardScenarios,
  type DashboardCondition,
  type DashboardQuery,
  type DashboardScenario,
} from '@entities/dashboard'
import { useTrainingRecordPage } from '@entities/training-record'
import {
  canCompareDashboardPeriod,
  getInitialDashboardQuery,
  validateDashboardPeriod,
} from './presentation'

export type DashboardTab = 'overview' | 'comparison' | 'scenarios'

/** 기간·조건·탭·상황 선택과 관련 기록의 페이지 상태를 관리합니다. */
export const useDashboardAnalyticsView = () => {
  const [query, setQuery] = useState(getInitialDashboardQuery)
  const [draft, setDraft] = useState(query)
  const [validationError, setValidationError] = useState<string | null>(null)
  const [tab, setTab] = useState<DashboardTab>('overview')
  const [comparisonMode, setComparisonMode] = useState<'overall' | 'matched'>('overall')
  const [scenarioPage, setScenarioPage] = useState(0)
  const [selectedScenario, setSelectedScenario] = useState<DashboardScenario | null>(null)
  const [recordPage, setRecordPage] = useState(0)
  const [recordSelection, setRecordSelection] = useState<Partial<DashboardQuery>>({})
  const canCompare = canCompareDashboardPeriod(query)
  const overview = useDashboardOverview(query, tab === 'overview')
  const comparison = useDashboardComparison(query, tab === 'comparison' && canCompare)
  const scenarios = useDashboardScenarios(
    { ...query, page: scenarioPage, size: 5 },
    tab === 'scenarios' && canCompare,
  )
  const scenarioDetail = useDashboardScenarios(
    {
      ...query,
      scenarioId: selectedScenario?.scenarioId,
      sessionType: selectedScenario?.sessionType ?? query.sessionType,
      includeSeries: true,
      page: 0,
      size: 1,
    },
    tab === 'scenarios' && selectedScenario !== null && canCompare,
  )
  // interval은 대시보드 전용 옵션이므로 기록 검색에 전달하지 않습니다.
  const recordFilters = {
    from: query.from,
    to: query.to,
    sessionType: query.sessionType,
    scenarioId: query.scenarioId,
    scenarioVersion: query.scenarioVersion,
    difficulty: query.difficulty,
    aiPersonality: query.aiPersonality,
    scriptLevel: query.scriptLevel,
    ...recordSelection,
  }
  const records = useTrainingRecordPage({ ...recordFilters, page: recordPage, size: 5 })

  /** 유효한 조건만 적용하고 이전 조회에서 선택한 항목을 초기화합니다. */
  const handleApply = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const error = validateDashboardPeriod(draft.from, draft.to)
    setValidationError(error)
    if (error) return
    setQuery(draft)
    setScenarioPage(0)
    setSelectedScenario(null)
    setRecordSelection({})
    setRecordPage(0)
  }

  /** 특정 날짜나 구간의 관련 기록을 조회합니다. */
  const handleSelectPeriod = (from: string, to = from, scenario?: DashboardScenario) => {
    setRecordSelection({
      from,
      to,
      ...(scenario ? { scenarioId: scenario.scenarioId, sessionType: scenario.sessionType } : {}),
    })
    setRecordPage(0)
  }

  /** 상황의 상세 추이와 같은 상황의 기록을 함께 선택합니다. */
  const handleSelectScenario = (scenario: DashboardScenario) => {
    setSelectedScenario(scenario)
    setRecordSelection({ scenarioId: scenario.scenarioId, sessionType: scenario.sessionType })
    setRecordPage(0)
  }

  /** 조건이 알려진 필드만 기록 검색에 적용합니다. */
  const handleSelectCondition = (
    condition: DashboardCondition,
    period?: { from: string; to: string },
  ) => {
    setRecordSelection({
      ...Object.fromEntries(Object.entries(condition).filter(([, value]) => value !== null)),
      ...(period ? { from: period.from, to: period.to } : {}),
    })
    setRecordPage(0)
  }

  /** 관련 기록을 현재 통계 조회 조건으로 되돌립니다. */
  const handleResetRecords = () => {
    setRecordSelection({})
    setRecordPage(0)
  }

  return {
    query,
    draft,
    setDraft,
    validationError,
    tab,
    setTab,
    comparisonMode,
    setComparisonMode,
    canCompare,
    overview,
    comparison,
    scenarios,
    scenarioDetail,
    scenarioPage,
    setScenarioPage,
    selectedScenario,
    records,
    recordPage,
    setRecordPage,
    recordFilters,
    hasRecordSelection: Object.keys(recordSelection).length > 0,
    handleApply,
    handleSelectPeriod,
    handleSelectScenario,
    handleSelectCondition,
    handleResetRecords,
  }
}

export type DashboardAnalyticsViewModel = ReturnType<typeof useDashboardAnalyticsView>
