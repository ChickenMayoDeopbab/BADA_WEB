import {
  getRecommendedScenario,
  getScenarioExample,
  getScenarios,
} from '../api/scenarioTrainingApi'
import type { Scenario, ScenarioCategory } from '@entities/scenario'
import { getApiErrorMessage } from '@shared/api'
import { useQuery } from '@tanstack/react-query'
import { useEffect, useMemo, useRef, useState } from 'react'

export type ScenarioTab = 'basic' | 'custom' | 'shared'

/** 시나리오 목록의 조회, 분류, 검색과 상세 패널 상태를 관리합니다. */
export const useScenarioCatalog = () => {
  const [selectedTab, setSelectedTab] = useState<ScenarioTab>('basic')
  const [selectedCategory, setSelectedCategory] = useState<ScenarioCategory | 'all'>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedScenario, setSelectedScenario] = useState<Scenario | null>(null)
  const [isDetailOpen, setIsDetailOpen] = useState(false)
  const detailCloseTimerRef = useRef<number | null>(null)

  const scenariosQuery = useQuery({
    queryKey: ['scenarios'],
    queryFn: getScenarios,
    refetchOnMount: 'always',
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

  const visibleScenarios = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase()

    return (scenariosQuery.data ?? []).filter((scenario) => {
      const isInTab =
        selectedTab === 'basic'
          ? !scenario.isCustom
          : selectedTab === 'custom'
            ? scenario.isCustom && !scenario.isCopied
            : scenario.isCustom && scenario.isCopied
      const isInCategory = selectedCategory === 'all' || scenario.category === selectedCategory
      const matchesQuery =
        !normalizedQuery ||
        scenario.title.toLowerCase().includes(normalizedQuery) ||
        scenario.content.toLowerCase().includes(normalizedQuery)

      return isInTab && isInCategory && matchesQuery
    })
  }, [scenariosQuery.data, searchQuery, selectedCategory, selectedTab])

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
  }

  /** 닫힘 애니메이션이 끝난 뒤 선택한 시나리오를 정리합니다. */
  const handleCloseDetail = () => {
    setIsDetailOpen(false)
    detailCloseTimerRef.current = window.setTimeout(() => {
      setSelectedScenario(null)
      detailCloseTimerRef.current = null
    }, 260)
  }

  return {
    selectedTab,
    selectedCategory,
    searchQuery,
    selectedScenario,
    isDetailOpen,
    scenarios: visibleScenarios,
    recommendedScenario: recommendationQuery.data,
    example: exampleQuery.data,
    isLoading: scenariosQuery.isPending,
    isRefreshing: scenariosQuery.isFetching,
    errorMessage: scenariosQuery.isError
      ? getApiErrorMessage(scenariosQuery.error, '시나리오 목록을 불러오지 못했습니다.')
      : '',
    isExampleLoading: exampleQuery.isPending && selectedScenario !== null,
    exampleErrorMessage: exampleQuery.isError
      ? getApiErrorMessage(exampleQuery.error, '예시 대화를 불러오지 못했습니다.')
      : '',
    setSelectedCategory,
    setSearchQuery,
    handleTabChange,
    handleOpenDetail,
    handleCloseDetail,
    refetch: scenariosQuery.refetch,
  }
}
