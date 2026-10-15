import { getDrawerCloseDelay } from '@shared/lib'
import {
  deleteCustomScenario,
  getRecommendedScenario,
  getScenarioExample,
  getScenarios,
  getScenarioFeedback,
  getRingingTrainingCallSchedule,
} from '../api/scenarioTrainingApi'
import type { Scenario, ScenarioCategory } from '@entities/scenario'
import { getApiErrorMessage } from '@shared/api'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { routePaths } from '@shared/config'

export type ScenarioTab = 'basic' | 'custom' | 'shared'

/** 시나리오 목록의 조회, 분류, 검색과 상세 패널 상태를 관리합니다. */
export const useScenarioCatalog = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const queryClient = useQueryClient()
  const [selectedTab, setSelectedTab] = useState<ScenarioTab>(() =>
    location.state?.selectedTab === 'custom' || location.state?.selectedTab === 'shared'
      ? location.state.selectedTab
      : 'basic',
  )
  const [selectedCategory, setSelectedCategory] = useState<ScenarioCategory | 'all'>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedScenario, setSelectedScenario] = useState<Scenario | null>(null)
  const [isDetailOpen, setIsDetailOpen] = useState(false)
  const [isDetailMenuOpen, setIsDetailMenuOpen] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<Scenario | null>(null)
  const detailCloseTimerRef = useRef<number | null>(null)

  const scenariosQuery = useQuery({
    queryKey: ['scenarios'],
    queryFn: () => getScenarios(),
    refetchOnMount: 'always',
  })
  const categoryScenariosQuery = useQuery({
    queryKey: ['scenarios', 'category', selectedCategory],
    queryFn: () => getScenarios(selectedCategory as ScenarioCategory),
    enabled: selectedTab === 'basic' && selectedCategory !== 'all',
  })
  const recommendationQuery = useQuery({
    queryKey: ['scenario-recommendation'],
    queryFn: getRecommendedScenario,
  })
  const exampleQuery = useQuery({
    queryKey: ['scenario-example', selectedScenario?.scenarioId],
    queryFn: () => getScenarioExample(selectedScenario?.scenarioId as number),
    enabled: selectedScenario !== null,
  })
  const feedbackQuery = useQuery({
    queryKey: ['scenario-feedback', selectedScenario?.scenarioId],
    queryFn: () => getScenarioFeedback(selectedScenario!.scenarioId),
    enabled: Boolean(selectedScenario && selectedScenario.practiceCount > 0 && isDetailOpen),
    retry: false,
  })
  const ringingQuery = useQuery({
    queryKey: ['training-call-ringing'],
    queryFn: ({ signal }) => getRingingTrainingCallSchedule(signal),
    refetchInterval: 5000,
    retry: false,
  })
  const deleteScenarioMutation = useMutation({
    mutationFn: deleteCustomScenario,
    meta: { successMessage: '시나리오를 삭제했어요.' },
    onSuccess: async (_, deletedScenarioId) => {
      queryClient.removeQueries({ queryKey: ['scenario-example', deletedScenarioId] })
      queryClient.removeQueries({ queryKey: ['scenario-feedback', deletedScenarioId] })
      setDeleteTarget(null)
      setIsDetailMenuOpen(false)
      if (selectedScenario?.scenarioId === deletedScenarioId) {
        setIsDetailOpen(false)
        setSelectedScenario(null)
      }
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['scenarios'] }),
        queryClient.invalidateQueries({ queryKey: ['scenario-recommendation'] }),
      ])
    },
  })

  const activeScenariosQuery =
    selectedTab === 'basic' && selectedCategory !== 'all' ? categoryScenariosQuery : scenariosQuery

  const visibleScenarios = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase()

    return (activeScenariosQuery.data ?? []).filter((scenario) => {
      const isInTab =
        selectedTab === 'basic'
          ? !scenario.isCustom
          : selectedTab === 'custom'
            ? scenario.isCustom && !scenario.isCopied
            : scenario.isCustom && scenario.isCopied
      const matchesQuery =
        !normalizedQuery ||
        scenario.title.toLowerCase().includes(normalizedQuery) ||
        scenario.content.toLowerCase().includes(normalizedQuery)

      return isInTab && matchesQuery
    })
  }, [activeScenariosQuery.data, searchQuery, selectedTab])

  useEffect(
    () => () => {
      if (detailCloseTimerRef.current) window.clearTimeout(detailCloseTimerRef.current)
    },
    [],
  )

  /** 탭을 바꾸면서 기본 제공 탭이 아니면 카테고리 필터를 초기화합니다. */
  const handleTabChange = (tab: ScenarioTab) => {
    setSelectedTab(tab)
    if (tab !== 'basic') setSelectedCategory('all')
  }

  /** 선택한 시나리오의 상세 패널을 엽니다. */
  const handleOpenDetail = (scenario: Scenario) => {
    if (detailCloseTimerRef.current) {
      window.clearTimeout(detailCloseTimerRef.current)
      detailCloseTimerRef.current = null
    }
    setSelectedScenario(scenario)
    setIsDetailOpen(true)
    setIsDetailMenuOpen(false)
    setDeleteTarget(null)
    deleteScenarioMutation.reset()
  }

  /** 닫힘 애니메이션이 끝난 뒤 선택한 시나리오를 정리합니다. */
  const handleCloseDetail = () => {
    setIsDetailOpen(false)
    setIsDetailMenuOpen(false)
    setDeleteTarget(null)
    detailCloseTimerRef.current = window.setTimeout(() => {
      setSelectedScenario(null)
      detailCloseTimerRef.current = null
    }, getDrawerCloseDelay())
  }

  /** 상세 패널 우측 상단의 시나리오 메뉴를 열거나 닫습니다. */
  const handleToggleDetailMenu = () => setIsDetailMenuOpen((isOpen) => !isOpen)

  /** 내 목록의 커스텀 시나리오 삭제 확인 창을 엽니다. 가져온 사본도 서버에서 소유권을 확인합니다. */
  const handleOpenDeleteDialog = (scenario = selectedScenario) => {
    if (!scenario?.isCustom) return

    deleteScenarioMutation.reset()
    setIsDetailMenuOpen(false)
    setDeleteTarget(scenario)
  }

  /** 커스텀 시나리오 삭제를 취소합니다. */
  const handleCloseDeleteDialog = () => {
    if (deleteScenarioMutation.isPending) return

    setDeleteTarget(null)
    deleteScenarioMutation.reset()
  }

  /** 확인한 커스텀 시나리오를 서버에서 삭제합니다. */
  const handleDeleteScenario = () => {
    if (!deleteTarget?.isCustom || deleteScenarioMutation.isPending) {
      return
    }

    deleteScenarioMutation.mutate(deleteTarget.scenarioId)
  }

  /** 선택한 시나리오의 훈련 설정을 엽니다. */
  const handleStartScenario = (scenario: Scenario) => {
    navigate(`/training/${scenario.scenarioId}/settings`, { state: { scenario } })
  }

  /** 기존 커스텀 시나리오 경로로 이동합니다. */
  const handleCreateCustomScenario = () => navigate(routePaths.trainingCustomNew)

  /** 다른 페이지에서 돌아와도 서버에 남아 있는 수신 전화를 수락할 수 있습니다. */
  const handleOpenRingingCall = () => {
    if (!ringingQuery.data) return
    navigate('/training/scheduled/call', { state: { schedule: ringingQuery.data } })
  }

  return {
    handleStartScenario,
    handleCreateCustomScenario,
    selectedTab,
    selectedCategory,
    searchQuery,
    selectedScenario,
    isDetailOpen,
    isDetailMenuOpen,
    deleteTarget,
    scenarios: visibleScenarios,
    recommendedScenario: recommendationQuery.data?.scenario,
    recommendationIconUrl: recommendationQuery.data?.categoryIconUrl,
    ringingSchedule: ringingQuery.data,
    handleOpenRingingCall,
    feedback: feedbackQuery.data,
    isFeedbackLoading: feedbackQuery.isPending && !feedbackQuery.data,
    feedbackErrorMessage: feedbackQuery.isError
      ? getApiErrorMessage(feedbackQuery.error, '최근 훈련 피드백을 불러오지 못했어요.')
      : '',
    example: exampleQuery.data,
    isLoading: activeScenariosQuery.isPending,
    isRefreshing: activeScenariosQuery.isFetching,
    errorMessage:
      activeScenariosQuery.isError && !activeScenariosQuery.data
        ? getApiErrorMessage(activeScenariosQuery.error, '시나리오 목록을 불러오지 못했습니다.')
        : '',
    isExampleLoading: exampleQuery.isPending && selectedScenario !== null,
    exampleErrorMessage: exampleQuery.isError
      ? getApiErrorMessage(exampleQuery.error, '예시 대화를 불러오지 못했습니다.')
      : '',
    isDeleting: deleteScenarioMutation.isPending,
    deleteErrorMessage: deleteScenarioMutation.isError
      ? getApiErrorMessage(deleteScenarioMutation.error, '시나리오를 삭제하지 못했습니다.')
      : '',
    setSelectedCategory,
    setSearchQuery,
    handleTabChange,
    handleOpenDetail,
    handleCloseDetail,
    handleToggleDetailMenu,
    handleOpenDeleteDialog,
    handleCloseDeleteDialog,
    handleDeleteScenario,
    refetch: activeScenariosQuery.refetch,
  }
}
