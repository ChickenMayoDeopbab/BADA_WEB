import { describe, expect, it } from 'vitest'
import { getDashboardWeekQuery } from './weeklyOverview'

// 서버의 서울 날짜에 맞춰 미래 날짜를 조회하지 않는 주간 기간을 검증합니다.
describe('getDashboardWeekQuery', () => {
  it('UTC 일요일이 서울 월요일인 경우 새 주를 조회한다', () => {
    expect(getDashboardWeekQuery(new Date('2026-10-11T15:01:00Z'))).toEqual({
      from: '2026-10-12',
      to: '2026-10-12',
      interval: 'DAY',
    })
  })
  it('서울 일요일에는 월요일부터 일요일까지 조회한다', () => {
    expect(getDashboardWeekQuery(new Date('2026-10-18T05:00:00Z'))).toEqual({
      from: '2026-10-12',
      to: '2026-10-18',
      interval: 'DAY',
    })
  })
})
