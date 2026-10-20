import { useEffect, useRef, useState, type FormEvent } from 'react'
import { getDrawerCloseDelay } from '@shared/lib'
import {
  getDashboardWeekQuery,
  useDashboardComparison,
  useDashboardScenarios,
  type DashboardCondition,
  type DashboardFilters,
  type DashboardMetricKey,
  type DashboardScenario,
  type DashboardQuery,
} from '@entities/dashboard'
import { useTrainingRecordPage } from '@entities/training-record'
import { validateDashboardDetailsPeriod, type DashboardDetailView } from './dashboardDetails'

/** 대시보드 상세 패널의 조회 조건·페이지·선택 상황과 관련 기록을 관리합니다. */
export const useDashboardDetails = () => {
  const [isOpen, setIsOpen] = useState(false)
  const closeTimerRef = useRef<number | null>(null)
  const [view, setView] = useState<DashboardDetailView | null>(null)
  const [query, setQuery] = useState(getDashboardWeekQuery)
  const [draft, setDraft] = useState(query)
  const [validationError, setValidationError] = useState<string | null>(null)
  const [mode, setMode] = useState<'overall' | 'matched'>('overall')
  const [scenarioPage, setScenarioPage] = useState(0)
  const [selectedScenario, setSelectedScenario] = useState<DashboardScenario | null>(null)
  const [seriesMetric, setSeriesMetric] = useState<DashboardMetricKey>('selfReportedAnxiety')
  const [recordPage, setRecordPage] = useState(0)
  const [recordSelection, setRecordSelection] = useState<
    DashboardFilters & { from?: string; to?: string }
  >({})
  const comparison = useDashboardComparison(query, isOpen && view === 'comparison')
  const scenarios = useDashboardScenarios(
    { ...query, page: scenarioPage, size: 5 },
    isOpen && view === 'scenarios',
  )
  const scenarioDetail = useDashboardScenarios(
    {
      ...query,
      scenarioId: selectedScenario?.scenarioId,
      sessionType: selectedScenario?.sessionType ?? query.sessionType,
      page: 0,
      size: 1,
      includeSeries: true,
    },
    isOpen && view === 'scenarios' && selectedScenario !== null,
  )
  const recordFilters = {
    from: query.from,
    to: query.to,
    sessionType: query.sessionType,
    difficulty: query.difficulty,
    aiPersonality: query.aiPersonality,
    scriptLevel: query.scriptLevel,
    ...recordSelection,
  }
  const records = useTrainingRecordPage({ ...recordFilters, page: recordPage, size: 5 }, isOpen)

  useEffect(
    () => () => {
      if (closeTimerRef.current !== null) window.clearTimeout(closeTimerRef.current)
    },
    [],
  )

  /** 시나리오 패널과 같은 닫힘 효과가 끝난 뒤 상세 내용을 정리합니다. */
  const handleClose = () => {
    setIsOpen(false)
    if (closeTimerRef.current !== null) window.clearTimeout(closeTimerRef.current)
    closeTimerRef.current = window.setTimeout(() => {
      setView(null)
      closeTimerRef.current = null
    }, getDrawerCloseDelay())
  }

  /** 원래 대시보드를 이동하지 않고 선택한 상세를 엽니다. */
  const handleOpen = (next: DashboardDetailView) => {
    if (closeTimerRef.current !== null) {
      window.clearTimeout(closeTimerRef.current)
      closeTimerRef.current = null
    }
    setIsOpen(true)
    if (view !== next) {
      setSelectedScenario(null)
      setScenarioPage(0)
      setRecordSelection({})
      setRecordPage(0)
    }
    setView(next)
  }

  /** 날짜와 모달의 설정을 함께 적용하고 이전 선택과 페이지를 초기화합니다. */
  const handleApplyQuery = (next: DashboardQuery) => {
    const error = validateDashboardDetailsPeriod(next)
    setValidationError(error)
    if (error) return false
    setDraft(next)
    setQuery(next)
    setScenarioPage(0)
    setSelectedScenario(null)
    setRecordSelection({})
    setRecordPage(0)
    return true
  }

  /** 날짜 조회 폼의 적용 요청을 처리합니다. */
  const handleApply = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    handleApplyQuery(draft)
  }

  /** 선택한 상황의 추이와 같은 상황의 기록을 조회합니다. */
  const handleSelectScenario = (scenario: DashboardScenario) => {
    setSelectedScenario(scenario)
    setRecordSelection({ scenarioId: scenario.scenarioId, sessionType: scenario.sessionType })
    setRecordPage(0)
  }

  /** 비교 기간 또는 선택한 추이 구간의 기록으로 좁힙니다. */
  const handleSelectPeriod = (period: { from: string; to: string }) => {
    setRecordSelection({
      ...period,
      ...(selectedScenario && view === 'scenarios'
        ? { scenarioId: selectedScenario.scenarioId, sessionType: selectedScenario.sessionType }
        : {}),
    })
    setRecordPage(0)
  }

  /** 알려진 조건을 기록 검색에 전달하고 통계와 같은 기간을 조회합니다. */
  const handleSelectCondition = (
    condition: DashboardCondition,
    period?: { from: string; to: string },
  ) => {
    setRecordSelection({
      ...Object.fromEntries(Object.entries(condition).filter(([, value]) => value != null)),
      ...period,
    })
    setRecordPage(0)
  }

  /** 기록을 현재 기간·조건 전체로 되돌립니다. */
  const handleResetRecords = () => {
    setRecordSelection({})
    setRecordPage(0)
  }

  /** 상세 선택을 해제하고 상황 목록으로 돌아갑니다. */
  const handleClearScenario = () => {
    setSelectedScenario(null)
    handleResetRecords()
  }

  return {
    isOpen,
    view,
    query,
    draft,
    setDraft,
    validationError,
    mode,
    setMode,
    comparison,
    scenarios,
    scenarioDetail,
    scenarioPage,
    setScenarioPage,
    selectedScenario,
    seriesMetric,
    setSeriesMetric,
    records,
    recordPage,
    setRecordPage,
    recordFilters,
    hasRecordSelection: Object.keys(recordSelection).length > 0,
    handleOpen,
    handleClose,
    handleApply,
    handleApplyQuery,
    handleSelectScenario,
    handleSelectPeriod,
    handleSelectCondition,
    handleResetRecords,
    handleClearScenario,
  }
}

export type DashboardDetailsModel = ReturnType<typeof useDashboardDetails>
