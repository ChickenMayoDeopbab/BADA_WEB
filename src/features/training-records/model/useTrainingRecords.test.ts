import { act, renderHook } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { useTrainingRecords } from './useTrainingRecords'

vi.mock('@entities/training-record', () => ({
  dummyTrainingRecords: Array.from({ length: 11 }, (_, index) => ({
    id: `record-${index + 1}`,
    date: '8월 22일',
    title: `훈련 기록 ${index + 1}`,
    emoji: '📞',
    duration: '3분 12초',
    feedbackCount: 1,
    startedAt: '오후 01:22',
    anxietyScore: 5,
    feedbacks: [],
  })),
}))

describe('useTrainingRecords', () => {
  it('일별 탭과 첫 번째 페이지로 시작한다', () => {
    const { result } = renderHook(() => useTrainingRecords())

    expect(result.current.period).toBe('daily')
    expect(result.current.currentPage).toBe(1)
    expect(result.current.paginatedRecords).toHaveLength(10)
    expect(result.current.totalPages).toBe(2)
  })

  it('다음 페이지를 표시하고 검색할 때 첫 페이지로 돌아간다', () => {
    const { result } = renderHook(() => useTrainingRecords())

    act(() => result.current.handlePageChange(2))

    expect(result.current.currentPage).toBe(2)
    expect(result.current.paginatedRecords).toHaveLength(1)

    act(() => result.current.handleSearchQueryChange('훈련 기록 1'))

    expect(result.current.currentPage).toBe(1)
    expect(result.current.totalPages).toBe(1)
  })

  it('적용한 날짜 범위에 포함된 기록만 표시한다', () => {
    const year = new Date().getFullYear()
    const { result } = renderHook(() =>
      useTrainingRecords({
        start: new Date(year, 8, 1),
        end: new Date(year, 8, 30),
      }),
    )

    expect(result.current.filteredRecords).toHaveLength(0)
    expect(result.current.paginatedRecords).toHaveLength(0)
  })
})
