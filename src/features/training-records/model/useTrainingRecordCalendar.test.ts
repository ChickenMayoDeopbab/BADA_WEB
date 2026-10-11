import { act, renderHook } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { useTrainingRecordCalendar } from './useTrainingRecordCalendar'

afterEach(() => vi.useRealTimers())

describe('useTrainingRecordCalendar', () => {
  it('기간 탭에 맞는 오늘 기준 범위를 적용한다', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date(2026, 9, 1, 12))
    const { result } = renderHook(() => useTrainingRecordCalendar())

    expect(result.current.appliedRange).toEqual({
      start: new Date(2026, 9, 1),
      end: new Date(2026, 9, 1),
    })

    act(() => result.current.handleApplyPeriodRange('weekly'))
    expect(result.current.appliedRange).toEqual({
      start: new Date(2026, 8, 25),
      end: new Date(2026, 9, 1),
    })

    act(() => result.current.handleApplyPeriodRange('monthly'))
    expect(result.current.appliedRange).toEqual({
      start: new Date(2026, 8, 1),
      end: new Date(2026, 9, 1),
    })
  })

  it('선택한 날짜 한 번으로 기간 탭에 맞는 조회 범위를 적용한다', () => {
    const { result } = renderHook(() => useTrainingRecordCalendar())
    const selectedDate = new Date(2026, 8, 5)

    act(() => result.current.handleOpenCalendar())
    act(() => result.current.handleSelectDate(selectedDate, 'daily'))
    expect(result.current.draftRange).toEqual({ start: selectedDate, end: selectedDate })

    act(() => result.current.handleSelectDate(selectedDate, 'weekly'))
    expect(result.current.draftRange).toEqual({
      start: new Date(2026, 7, 30),
      end: selectedDate,
    })

    act(() => result.current.handleSelectDate(selectedDate, 'monthly'))
    expect(result.current.draftRange).toEqual({
      start: new Date(2026, 7, 5),
      end: selectedDate,
    })

    act(() => result.current.handleApplyCalendar())

    expect(result.current.appliedRange).toEqual(result.current.draftRange)
    expect(result.current.isCalendarOpen).toBe(false)

    act(() => result.current.handleApplyPeriodRange('weekly'))
    expect(result.current.appliedRange).toEqual({
      start: new Date(2026, 7, 30),
      end: selectedDate,
    })
  })

  it('Escape 키를 누르면 변경한 범위를 취소한다', () => {
    const { result } = renderHook(() => useTrainingRecordCalendar())
    const initialRange = result.current.appliedRange

    act(() => result.current.handleOpenCalendar())
    act(() => result.current.handleSelectDate(new Date(new Date().getFullYear(), 9, 1), 'daily'))
    act(() => window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' })))

    expect(result.current.draftRange).toEqual(initialRange)
    expect(result.current.isCalendarOpen).toBe(false)
  })
})
