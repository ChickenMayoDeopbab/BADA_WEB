import { describe, expect, it } from 'vitest'
import { formatDashboardDelta, validateDashboardDetailsPeriod } from './dashboardDetails'

// 서버의 기간 제한과 서로 다른 변화량 단위를 검증합니다.
describe('dashboard detail queries', () => {
  it('윤년의 366일은 허용하고 367일은 서버에 요청하지 않는다', () => {
    expect(
      validateDashboardDetailsPeriod({ from: '2024-01-01', to: '2024-12-31' }, '2026-10-18'),
    ).toBeNull()
    expect(
      validateDashboardDetailsPeriod({ from: '2024-01-01', to: '2025-01-01' }, '2026-10-18'),
    ).toContain('366일')
  })
  it.each([
    ['2026-02-30', '2026-03-01'],
    ['2026-10-18', '2026-10-17'],
    ['2026-10-01', '2026-10-19'],
    ['2000-01-01', '2000-01-01'],
  ])('유효하지 않은 현재 또는 비교 기간을 거부한다: %s ~ %s', (from, to) => {
    expect(validateDashboardDetailsPeriod({ from, to }, '2026-10-18')).not.toBeNull()
  })
  it('비율 변화는 %p로 표시하고 계산 불가와 실제 0을 구분한다', () => {
    expect(formatDashboardDelta(-5, 'PERCENTAGE_POINT')).toBe('-5%p')
    expect(formatDashboardDelta(0, 'POINT')).toBe('0점')
    expect(formatDashboardDelta(200, 'MILLISECOND')).toBe('+200ms')
    expect(formatDashboardDelta(null, 'PERCENTAGE_POINT')).toBe('—')
  })
})
