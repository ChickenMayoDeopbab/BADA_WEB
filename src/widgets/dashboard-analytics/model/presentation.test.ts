import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  canCompareDashboardPeriod,
  formatDashboardValue,
  getInitialDashboardQuery,
  validateDashboardPeriod,
} from './presentation'

// 통계의 시간대와 결측값 및 서버 기간 경계 조건을 검증합니다.
describe('dashboard presentation', () => {
  afterEach(() => vi.useRealTimers())

  it('서울의 자정이 지나면 UTC 날짜와 무관하게 최근 28일을 조회한다', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-10-17T16:00:00Z'))
    expect(getInitialDashboardQuery()).toEqual({
      from: '2026-09-21',
      to: '2026-10-18',
      interval: 'WEEK',
    })
  })

  it('측정한 0은 표시하고 미측정 값은 0으로 바꾸지 않는다', () => {
    expect(formatDashboardValue(0, 'PERCENT')).toBe('0%')
    expect(formatDashboardValue(null, 'PERCENT')).toBe('—')
    expect(formatDashboardValue(-2.5, 'PERCENTAGE_POINT')).toBe('-2.5%p')
    expect(formatDashboardValue(400, 'MILLISECOND')).toBe('400ms')
  })

  it('윤년을 포함한 최대 366일까지만 허용한다', () => {
    expect(validateDashboardPeriod('2024-01-01', '2024-12-31', '2026-10-18')).toBeNull()
    expect(validateDashboardPeriod('2024-01-01', '2025-01-01', '2026-10-18')).not.toBeNull()
  })

  it.each([
    ['', '2026-10-18'],
    ['2026-02-30', '2026-03-01'],
    ['1999-12-31', '2000-01-01'],
    ['2026-10-18', '2026-10-17'],
    ['2026-10-17', '2026-10-19'],
  ])('잘못된 날짜 범위를 거부한다: %s ~ %s', (from, to) => {
    expect(validateDashboardPeriod(from, to, '2026-10-18')).not.toBeNull()
  })

  it('이전 기간이 2000년보다 앞서면 비교 요청을 막는다', () => {
    expect(canCompareDashboardPeriod({ from: '2000-01-01', to: '2000-01-01' })).toBe(false)
    expect(canCompareDashboardPeriod({ from: '2000-01-02', to: '2000-01-02' })).toBe(true)
  })
})
