import { act, renderHook } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { useDashboardDateCalendar } from './useDashboardDateCalendar'

// 날짜 순서, 취소, 서버 기간 제한과 달력 월 경계를 검증합니다.
describe('useDashboardDateCalendar', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-10-18T03:00:00Z'))
  })
  afterEach(() => vi.useRealTimers())

  it('날짜 선택은 임시 상태에 두고 취소한 뒤 다시 열면 원래 범위를 복원한다', () => {
    const apply = vi.fn()
    const { result } = renderHook(() =>
      useDashboardDateCalendar({ from: '2026-10-12', to: '2026-10-18' }, apply),
    )
    act(() => result.current.handleOpen('from'))
    act(() => result.current.handleSelectDate('2026-10-01'))
    expect(result.current.activeField).toBe('to')
    expect(apply).not.toHaveBeenCalled()
    act(() => result.current.handleCancel())
    act(() => result.current.handleOpen('to'))
    expect(result.current.selection).toEqual({ from: '2026-10-12', to: '2026-10-18' })
    act(() => result.current.handleSelectDate('2026-10-14'))
    act(() => result.current.handleApply())
    expect(apply).toHaveBeenCalledExactlyOnceWith({ from: '2026-10-12', to: '2026-10-14' })
    expect(result.current.isOpen).toBe(false)
  })

  it('종료일보다 늦은 시작일 또는 시작일보다 이른 종료일을 고르면 반대 날짜도 맞춘다', () => {
    const { result } = renderHook(() =>
      useDashboardDateCalendar({ from: '2026-10-01', to: '2026-10-10' }, vi.fn()),
    )
    act(() => result.current.handleOpen('from'))
    act(() => result.current.handleSelectDate('2026-10-15'))
    expect(result.current.selection).toEqual({ from: '2026-10-15', to: '2026-10-15' })
    act(() => result.current.handleSelectDate('2026-09-30'))
    expect(result.current.selection).toEqual({ from: '2026-09-30', to: '2026-09-30' })
  })

  it('윤년의 29일과 연도 전환을 표시하고 미래 월·날짜를 선택하지 않는다', () => {
    const { result } = renderHook(() =>
      useDashboardDateCalendar({ from: '2024-02-01', to: '2024-02-29' }, vi.fn()),
    )
    act(() => result.current.handleOpen('from'))
    expect(result.current.days).toHaveLength(42)
    expect(result.current.days.filter(Boolean)).toHaveLength(29)
    expect(result.current.days).toContain('2024-02-29')
    act(() => result.current.handleChangeMonth(-2))
    expect(result.current.visibleMonth).toBe('2023-12')
    act(() => result.current.handleChangeMonth(34))
    expect(result.current.visibleMonth).toBe('2026-10')
    expect(result.current.canGoNext).toBe(false)
    act(() => result.current.handleChangeMonth(1))
    expect(result.current.visibleMonth).toBe('2026-10')
    act(() => result.current.handleSelectDate('2026-10-19'))
    expect(result.current.selection.from).toBe('2024-02-01')
  })

  it('366일을 넘는 범위는 적용하지 않는다', () => {
    const apply = vi.fn()
    const { result } = renderHook(() =>
      useDashboardDateCalendar({ from: '2024-01-01', to: '2024-12-31' }, apply),
    )
    act(() => result.current.handleOpen('to'))
    act(() => result.current.handleSelectDate('2025-01-01'))
    expect(result.current.error).toContain('366일')
    act(() => result.current.handleApply())
    expect(apply).not.toHaveBeenCalled()
    expect(result.current.isOpen).toBe(true)
  })
})
