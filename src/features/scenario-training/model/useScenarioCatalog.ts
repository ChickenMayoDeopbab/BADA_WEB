import {
  deleteCustomScenario,
  getRecommendedScenario,
  getScenarioExample,
  getScenarios,
} from '../api/scenarioTrainingApi'
import type { Scenario, ScenarioCategory } from '@entities/scenario'
import { getApiErrorMessage } from '@shared/api'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useEffect, useMemo, useRef, useState } from 'react'

export type ScenarioTab = 'basic' | 'custom' | 'shared'

/** 시나리오 목록의 조회, 분류, 검색과 상세 패널 상태를 관리합니다. */
export const useScenarioCatalog = () => {
  const queryClient = useQueryClient()
  const [selectedTab, setSelectedTab] = useState<ScenarioTab>('basic')
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
  const deleteScenarioMutation = useMutation({
    mutationFn: deleteCustomScenario,
    onSuccess: async (_, deletedScenarioId) => {
      queryClient.removeQueries({ queryKey: ['scenario-example', deletedScenarioId] })
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
    }, 260)
  }

  /** 상세 패널 우측 상단의 시나리오 메뉴를 열거나 닫습니다. */
  const handleToggleDetailMenu = () => setIsDetailMenuOpen((isOpen) => !isOpen)

  /** 현재 사용자가 만든 커스텀 시나리오의 삭제 확인 창을 엽니다. */
  const handleOpenDeleteDialog = (scenario = selectedScenario) => {
    if (!scenario?.isCustom || scenario.isCopied) return

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
    if (
      !deleteTarget?.isCustom ||
      deleteTarget.isCopied ||
      deleteScenarioMutation.isPending
    ) {
      return
    }

    deleteScenarioMutation.mutate(deleteTarget.scenarioId)
  }

  return {
    selectedTab,
    selectedCategory,
    searchQuery,
    selectedScenario,
    isDetailOpen,
    isDetailMenuOpen,
    deleteTarget,
    scenarios: visibleScenarios,
    recommendedScenario: recommendationQuery.data,
    example: exampleQuery.data,
    isLoading: activeScenariosQuery.isPending,
    isRefreshing: activeScenariosQuery.isFetching,
    errorMessage: activeScenariosQuery.isError
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
