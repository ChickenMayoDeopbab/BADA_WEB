import {
  deleteTrainingRecord,
  getTrainingRecord,
  getTrainingRecords,
} from '../api/trainingRecordsApi'
import type { TrainingPeriod } from '@entities/training-record'
import { getApiErrorMessage } from '@shared/api'
import { useMutation, useQueries, useQuery, useQueryClient } from '@tanstack/react-query'
import { useEffect, useMemo, useRef, useState } from 'react'
import type { TrainingRecordDateRange } from './useTrainingRecordCalendar'

const RECORDS_PER_PAGE = 10
const RECORDS_SYNC_INTERVAL_MS = 5_000
const TRAINING_RECORDS_QUERY_KEY = ['training-records'] as const

// 훈련 기록 화면의 조회, 검색, 선택, 상세 패널 상태를 관리합니다.
export const useTrainingRecords = (dateRange?: TrainingRecordDateRange) => {
  const queryClient = useQueryClient()
  const [period, setPeriod] = useState<TrainingPeriod>('daily')
  const [searchQuery, setSearchQuery] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedRecordId, setSelectedRecordId] = useState<number | null>(null)
  const [isDetailOpen, setIsDetailOpen] = useState(false)
  const [expandedFeedbackId, setExpandedFeedbackId] = useState<string | null>(null)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isAudioPlaying, setIsAudioPlaying] = useState(false)
  const detailCloseTimerRef = useRef<number | null>(null)

  const recordsQuery = useQuery({
    queryKey: TRAINING_RECORDS_QUERY_KEY,
    queryFn: getTrainingRecords,
    refetchInterval: RECORDS_SYNC_INTERVAL_MS,
    refetchOnMount: 'always',
    refetchOnReconnect: 'always',
    refetchOnWindowFocus: 'always',
  })
  const recordDetailQuery = useQuery({
    queryKey: [...TRAINING_RECORDS_QUERY_KEY, selectedRecordId],
    queryFn: () => getTrainingRecord(selectedRecordId as number),
    enabled: selectedRecordId !== null,
  })
  const deleteRecordMutation = useMutation({
    mutationFn: deleteTrainingRecord,
    onSuccess: async (_, deletedRecordId) => {
      queryClient.removeQueries({ queryKey: [...TRAINING_RECORDS_QUERY_KEY, deletedRecordId] })
      setSelectedRecordId(null)
      setIsDetailOpen(false)
      setIsMenuOpen(false)
      await queryClient.invalidateQueries({ queryKey: TRAINING_RECORDS_QUERY_KEY, exact: true })
    },
  })

  useEffect(
    () => () => {
      if (detailCloseTimerRef.current) {
        window.clearTimeout(detailCloseTimerRef.current)
      }
    },
    [],
  )

  const records = useMemo(() => recordsQuery.data ?? [], [recordsQuery.data])
  const filteredRecords = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase()
    const recordsInDateRange = dateRange
      ? records.filter((record) => {
          const recordDate = new Date(record.trainedAt)
          const rangeEnd = new Date(
            dateRange.end.getFullYear(),
            dateRange.end.getMonth(),
            dateRange.end.getDate() + 1,
          )

          return recordDate >= dateRange.start && recordDate < rangeEnd
        })
      : records

    const searchedRecords = normalizedQuery
      ? recordsInDateRange.filter((record) => record.title.toLowerCase().includes(normalizedQuery))
      : recordsInDateRange

    return [...searchedRecords].sort(
      (firstRecord, secondRecord) =>
        new Date(secondRecord.trainedAt).getTime() - new Date(firstRecord.trainedAt).getTime(),
    )
  }, [dateRange, records, searchQuery])

  const totalPages = Math.max(1, Math.ceil(filteredRecords.length / RECORDS_PER_PAGE))
  const safeCurrentPage = Math.min(currentPage, totalPages)
  const paginatedListRecords = useMemo(() => {
    const startIndex = (safeCurrentPage - 1) * RECORDS_PER_PAGE

    return filteredRecords.slice(startIndex, startIndex + RECORDS_PER_PAGE)
  }, [filteredRecords, safeCurrentPage])
  const visibleRecordDetailQueries = useQueries({
    queries: paginatedListRecords.map((record) => ({
      queryKey: [...TRAINING_RECORDS_QUERY_KEY, record.id],
      queryFn: () => getTrainingRecord(record.id),
      staleTime: 60_000,
    })),
  })
  const paginatedRecords = useMemo(
    () =>
      paginatedListRecords.map(
        (record, index) => visibleRecordDetailQueries[index]?.data ?? record,
      ),
    [paginatedListRecords, visibleRecordDetailQueries],
  )
  const selectedListRecord = records.find((record) => record.id === selectedRecordId) ?? null
  const selectedRecord = recordDetailQuery.data ?? selectedListRecord
  const totalDurationSeconds = filteredRecords.reduce(
    (total, record) => total + record.durationSeconds,
    0,
  )
  const totalFeedbackCount = filteredRecords.every((record) => record.feedbackCount === undefined)
    ? null
    : filteredRecords.reduce((total, record) => total + (record.feedbackCount ?? 0), 0)

  // 기간을 변경하고 기록 목록을 첫 페이지로 이동합니다.
  const handlePeriodChange = (nextPeriod: TrainingPeriod) => {
    setPeriod(nextPeriod)
    setCurrentPage(1)
  }

  // 검색어를 변경하고 검색 결과를 첫 페이지부터 표시합니다.
  const handleSearchQueryChange = (nextSearchQuery: string) => {
    setSearchQuery(nextSearchQuery)
    setCurrentPage(1)
  }

  // 유효한 범위 안에서 기록 목록 페이지를 변경합니다.
  const handlePageChange = (nextPage: number) => {
    setCurrentPage(Math.min(Math.max(nextPage, 1), totalPages))
  }

  // 선택한 기록의 상세 패널을 열고 상세 API 조회를 시작합니다.
  const handleOpenRecord = (recordId: number) => {
    if (detailCloseTimerRef.current) {
      window.clearTimeout(detailCloseTimerRef.current)
      detailCloseTimerRef.current = null
    }

    setSelectedRecordId(recordId)
    setIsDetailOpen(true)
    setExpandedFeedbackId(null)
    setIsMenuOpen(false)
    setIsAudioPlaying(false)
    deleteRecordMutation.reset()
  }

  // 상세 패널을 닫고 패널 내부 상태를 초기화합니다.
  const handleCloseRecord = () => {
    setIsDetailOpen(false)
    setExpandedFeedbackId(null)
    setIsMenuOpen(false)
    setIsAudioPlaying(false)

    detailCloseTimerRef.current = window.setTimeout(() => {
      setSelectedRecordId(null)
      detailCloseTimerRef.current = null
    }, 260)
  }

  // 피드백 상세 내용을 펼치거나 접습니다.
  const handleToggleFeedback = (feedbackId: string) => {
    setExpandedFeedbackId((currentId) => (currentId === feedbackId ? null : feedbackId))
    setIsAudioPlaying(false)
  }

  // 기록 관리 메뉴를 열거나 닫습니다.
  const handleToggleMenu = () => {
    setIsMenuOpen((isOpen) => !isOpen)
  }

  // 현재 선택한 기록을 서버에서 삭제합니다.
  const handleDeleteRecord = () => {
    if (selectedRecordId === null || deleteRecordMutation.isPending) {
      return
    }

    deleteRecordMutation.mutate(selectedRecordId)
  }

  // 오디오 미리보기의 재생 상태를 전환합니다.
  const handleToggleAudio = () => {
    setIsAudioPlaying((isPlaying) => !isPlaying)
  }

  return {
    records,
    filteredRecords,
    paginatedRecords,
    period,
    searchQuery,
    currentPage: safeCurrentPage,
    totalPages,
    selectedRecord,
    isDetailOpen,
    expandedFeedbackId,
    isMenuOpen,
    isAudioPlaying,
    isLoading: recordsQuery.isPending,
    recordsErrorMessage: recordsQuery.isError
      ? getApiErrorMessage(recordsQuery.error, '훈련 기록을 불러오지 못했습니다.')
      : '',
    isDetailLoading: recordDetailQuery.isPending && selectedRecordId !== null,
    detailErrorMessage: recordDetailQuery.isError
      ? getApiErrorMessage(recordDetailQuery.error, '훈련 기록 상세를 불러오지 못했습니다.')
      : '',
    isDeleting: deleteRecordMutation.isPending,
    deleteErrorMessage: deleteRecordMutation.isError
      ? getApiErrorMessage(deleteRecordMutation.error, '훈련 기록을 삭제하지 못했습니다.')
      : '',
    totalDurationSeconds,
    totalFeedbackCount,
    handlePeriodChange,
    handleSearchQueryChange,
    handlePageChange,
    handleOpenRecord,
    handleCloseRecord,
    handleToggleFeedback,
    handleToggleMenu,
    handleDeleteRecord,
    handleToggleAudio,
  }
}
