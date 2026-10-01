import { dummyTrainingRecords, type TrainingPeriod } from '@entities/training-record'
import { useMemo, useState } from 'react'

// 훈련 기록 화면의 검색, 선택, 상세 패널 상태를 관리합니다.
export const useTrainingRecords = () => {
  const [records, setRecords] = useState(dummyTrainingRecords)
  const [period, setPeriod] = useState<TrainingPeriod>('weekly')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedRecordId, setSelectedRecordId] = useState<string | null>(null)
  const [expandedFeedbackId, setExpandedFeedbackId] = useState<string | null>(null)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isAudioPlaying, setIsAudioPlaying] = useState(false)

  const filteredRecords = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase()

    if (!normalizedQuery) {
      return records
    }

    return records.filter((record) => {
      const searchableText = [
        record.title,
        ...record.feedbacks.flatMap((feedback) => [feedback.title, feedback.description ?? '']),
      ]
        .join(' ')
        .toLowerCase()

      return searchableText.includes(normalizedQuery)
    })
  }, [records, searchQuery])

  const selectedRecord = records.find((record) => record.id === selectedRecordId) ?? null

  // 선택한 기록의 상세 패널을 엽니다.
  const handleOpenRecord = (recordId: string) => {
    setSelectedRecordId(recordId)
    setExpandedFeedbackId(null)
    setIsMenuOpen(false)
    setIsAudioPlaying(false)
  }

  // 상세 패널을 닫고 패널 내부 상태를 초기화합니다.
  const handleCloseRecord = () => {
    setSelectedRecordId(null)
    setExpandedFeedbackId(null)
    setIsMenuOpen(false)
    setIsAudioPlaying(false)
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
    handleCloseRecord()
  }

  // 오디오 미리보기의 재생 상태를 전환합니다.
  const handleToggleAudio = () => {
    setIsAudioPlaying((isPlaying) => !isPlaying)
  }

  return {
    records,
    filteredRecords,
    period,
    searchQuery,
    selectedRecord,
    expandedFeedbackId,
    isMenuOpen,
    isAudioPlaying,
    setPeriod,
    setSearchQuery,
    handleOpenRecord,
    handleCloseRecord,
    handleToggleFeedback,
    handleToggleMenu,
    handleDeleteRecord,
    handleToggleAudio,
  }
}
