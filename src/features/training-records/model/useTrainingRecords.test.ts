import {
  deleteTrainingRecord,
  getTrainingRecord,
  getTrainingRecords,
} from '../api/trainingRecordsApi'
import type { TrainingRecord } from '@entities/training-record'
import { focusManager, QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { act, cleanup, renderHook, waitFor } from '@testing-library/react'
import { createElement, type ReactNode } from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { useTrainingRecords } from './useTrainingRecords'

vi.mock('../api/trainingRecordsApi', () => ({
  deleteTrainingRecord: vi.fn(),
  getTrainingRecord: vi.fn(),
  getTrainingRecords: vi.fn(),
}))

vi.mock('@shared/api', () => ({
  getApiErrorMessage: (_error: unknown, fallback: string) => fallback,
}))

const createRecord = (index: number, trainedAt = '2026-10-12T04:22:00Z'): TrainingRecord => ({
  id: index,
  sessionId: `session-${index}`,
  date: '10월 12일',
  trainedAt,
  title: `훈련 기록 ${index}`,
  emoji: '📞',
  duration: '3분 12초',
  durationSeconds: 192,
  startedAt: '오후 01:22',
  feedbacks: [],
})

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  })

  return ({ children }: { children: ReactNode }) =>
    createElement(QueryClientProvider, { client: queryClient }, children)
}

describe('useTrainingRecords', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(getTrainingRecords).mockResolvedValue(
      Array.from({ length: 11 }, (_, index) => createRecord(index + 1)),
    )
    vi.mocked(getTrainingRecord).mockImplementation(async (recordId) => ({
      ...createRecord(recordId),
      feedbackCount: recordId,
    }))
    vi.mocked(deleteTrainingRecord).mockResolvedValue(undefined)
  })

  afterEach(() => {
    cleanup()
    focusManager.setFocused(undefined)
  })

  it('API 기록을 조회하고 열 개씩 페이지를 나눈다', async () => {
    const { result } = renderHook(() => useTrainingRecords(), { wrapper: createWrapper() })

    await waitFor(() => expect(result.current.isLoading).toBe(false))

    expect(getTrainingRecords).toHaveBeenCalledOnce()
    expect(result.current.period).toBe('daily')
    expect(result.current.paginatedRecords).toHaveLength(10)
    expect(result.current.totalPages).toBe(2)
  })

  it('목록에 없는 기록도 전달받은 ID로 상세를 연다', async () => {
    const { result } = renderHook(() => useTrainingRecords(undefined, 37), { wrapper: createWrapper() })

    await waitFor(() => expect(result.current.selectedRecord?.id).toBe(37))
    expect(result.current.isDetailOpen).toBe(true)
    expect(getTrainingRecord).toHaveBeenCalledWith(37)
  })

  it('상세 응답에 이미지가 없어도 목록의 서버 아이콘을 유지한다', async () => {
    vi.mocked(getTrainingRecords).mockResolvedValue([{ ...createRecord(1), thumbnailUrl: 'https://example.com/category.png' }])
    const { result } = renderHook(() => useTrainingRecords(), { wrapper: createWrapper() })
    await waitFor(() => expect(result.current.paginatedRecords[0]?.feedbackCount).toBe(1))
    expect(result.current.paginatedRecords[0]?.thumbnailUrl).toBe('https://example.com/category.png')
    act(() => result.current.handleOpenRecord(1))
    await waitFor(() => expect(result.current.selectedRecord?.feedbackCount).toBe(1))
    expect(result.current.selectedRecord?.thumbnailUrl).toBe('https://example.com/category.png')
  })

  it('다음 페이지를 표시하고 검색할 때 첫 페이지로 돌아간다', async () => {
    const { result } = renderHook(() => useTrainingRecords(), { wrapper: createWrapper() })
    await waitFor(() => expect(result.current.isLoading).toBe(false))

    act(() => result.current.handlePageChange(2))

    expect(result.current.currentPage).toBe(2)
    expect(result.current.paginatedRecords).toHaveLength(1)

    act(() => result.current.handleSearchQueryChange('훈련 기록 1'))

    expect(result.current.currentPage).toBe(1)
    expect(result.current.totalPages).toBe(1)
  })

  it('전체 기록의 상세 피드백 개수를 조회해 합산한다', async () => {
    const { result } = renderHook(() => useTrainingRecords(), { wrapper: createWrapper() })

    await waitFor(() => expect(result.current.totalFeedbackCount).toBe(66))

    expect(getTrainingRecord).toHaveBeenCalledWith(1)
    expect(getTrainingRecord).toHaveBeenCalledTimes(11)
    expect(result.current.paginatedRecords[9]?.feedbackCount).toBe(10)
  })

  it('적용한 날짜 범위에 포함된 기록만 표시한다', async () => {
    vi.mocked(getTrainingRecords).mockResolvedValue([
      createRecord(1, '2026-09-30T12:00:00Z'),
      createRecord(2, '2026-10-12T12:00:00Z'),
    ])
    const { result } = renderHook(
      () =>
        useTrainingRecords({
          start: new Date(2026, 9, 12),
          end: new Date(2026, 9, 12),
        }),
      { wrapper: createWrapper() },
    )

    await waitFor(() => expect(result.current.isLoading).toBe(false))

    expect(result.current.filteredRecords.map((record) => record.id)).toEqual([2])
  })

  it('서버 응답 순서와 관계없이 최신 훈련부터 표시한다', async () => {
    vi.mocked(getTrainingRecords).mockResolvedValue([
      createRecord(1, '2026-10-10T12:00:00Z'),
      createRecord(2, '2026-10-12T12:00:00Z'),
      createRecord(3, '2026-10-11T12:00:00Z'),
    ])
    const { result } = renderHook(() => useTrainingRecords(), { wrapper: createWrapper() })

    await waitFor(() => expect(result.current.isLoading).toBe(false))

    expect(result.current.filteredRecords.map((record) => record.id)).toEqual([2, 3, 1])
  })

  it('화면을 다시 활성화하면 다른 기기에서 생성된 기록을 동기화한다', async () => {
    vi.mocked(getTrainingRecords)
      .mockResolvedValueOnce([createRecord(1)])
      .mockResolvedValue([createRecord(2), createRecord(1)])
    const { result } = renderHook(() => useTrainingRecords(), { wrapper: createWrapper() })
    await waitFor(() => expect(result.current.records).toHaveLength(1))

    act(() => focusManager.setFocused(false))
    act(() => focusManager.setFocused(true))

    await waitFor(() => expect(getTrainingRecords).toHaveBeenCalledTimes(2))
    await waitFor(() => expect(result.current.records.map((record) => record.id)).toEqual([2, 1]))
  })

  it('선택한 기록을 상세 조회하고 서버에서 삭제한다', async () => {
    const { result } = renderHook(() => useTrainingRecords(), { wrapper: createWrapper() })
    await waitFor(() => expect(result.current.isLoading).toBe(false))

    act(() => result.current.handleOpenRecord(1))
    await waitFor(() => expect(getTrainingRecord).toHaveBeenCalledWith(1))

    act(() => result.current.handleDeleteRecord())
    await waitFor(() => expect(vi.mocked(deleteTrainingRecord).mock.calls[0]?.[0]).toBe(1))
  })
})
