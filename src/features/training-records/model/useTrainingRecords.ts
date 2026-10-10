import { dummyTrainingRecords, type TrainingPeriod } from '@entities/training-record'
import { useEffect, useMemo, useRef, useState } from 'react'
import type { TrainingRecordDateRange } from './useTrainingRecordCalendar'

const RECORDS_PER_PAGE = 10

// 기록의 한글 날짜를 선택 범위와 비교할 수 있는 날짜로 변환합니다.
const parseRecordDate = (dateLabel: string, year: number) => {
  const match = dateLabel.match(/(\d+)월\s*(\d+)일/)

  return match ? new Date(year, Number(match[1]) - 1, Number(match[2])) : null
}

// 훈련 기록 화면의 검색, 선택, 상세 패널 상태를 관리합니다.
export const useTrainingRecords = (dateRange?: TrainingRecordDateRange) => {
  const [records, setRecords] = useState(dummyTrainingRecords)
  const [period, setPeriod] = useState<TrainingPeriod>('daily')
  const [searchQuery, setSearchQuery] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedRecordId, setSelectedRecordId] = useState<string | null>(null)
  const [isDetailOpen, setIsDetailOpen] = useState(false)
  const [expandedFeedbackId, setExpandedFeedbackId] = useState<string | null>(null)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isAudioPlaying, setIsAudioPlaying] = useState(false)
  const detailCloseTimerRef = useRef<number | null>(null)

  useEffect(
    () => () => {
      if (detailCloseTimerRef.current) {
        window.clearTimeout(detailCloseTimerRef.current)
      }
    },
    [],
  )

  const filteredRecords = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase()
    const recordsInDateRange = dateRange
      ? records.filter((record) => {
          const recordDate = parseRecordDate(record.date, dateRange.start.getFullYear())

          return Boolean(recordDate && recordDate >= dateRange.start && recordDate <= dateRange.end)
        })
      : records

    if (!normalizedQuery) {
      return recordsInDateRange
    }

    return recordsInDateRange.filter((record) => {
      const searchableText = [
        record.title,
        ...record.feedbacks.flatMap((feedback) => [feedback.title, feedback.description ?? '']),
      ]
        .join(' ')
        .toLowerCase()

      return searchableText.includes(normalizedQuery)
    })
  }, [dateRange, records, searchQuery])

  const totalPages = Math.max(1, Math.ceil(filteredRecords.length / RECORDS_PER_PAGE))
  const safeCurrentPage = Math.min(currentPage, totalPages)
  const paginatedRecords = useMemo(() => {
    const startIndex = (safeCurrentPage - 1) * RECORDS_PER_PAGE

    return filteredRecords.slice(startIndex, startIndex + RECORDS_PER_PAGE)
  }, [filteredRecords, safeCurrentPage])

  const selectedRecord = records.find((record) => record.id === selectedRecordId) ?? null

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

  // 선택한 기록의 상세 패널을 엽니다.
  const handleOpenRecord = (recordId: string) => {
    if (detailCloseTimerRef.current) {
      window.clearTimeout(detailCloseTimerRef.current)
      detailCloseTimerRef.current = null
    }

    setSelectedRecordId(recordId)
    setIsDetailOpen(true)
    setExpandedFeedbackId(null)
    setIsMenuOpen(false)
    setIsAudioPlaying(false)
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

  // 현재 선택한 기록을 목록에서 삭제합니다.
  const handleDeleteRecord = () => {
    if (!selectedRecordId) {
      return
    }

    setRecords((currentRecords) =>
      currentRecords.filter((record) => record.id !== selectedRecordId),
    )
    setSelectedRecordId(null)
    setIsDetailOpen(false)
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
