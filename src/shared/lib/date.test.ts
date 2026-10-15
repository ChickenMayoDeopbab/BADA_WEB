import { addDays, formatDuration, formatMonthDay, parseDateKey, toDateKey } from './date'
import { describe, expect, it } from 'vitest'

describe('date utilities', () => {
  it('converts between local dates and server date keys', () => {
    const date = new Date(2025, 8, 4)

    expect(toDateKey(date)).toBe('2025-09-04')
    expect(parseDateKey('2025-09-04')).toEqual(date)
  })

  it('moves across month boundaries', () => {
    expect(toDateKey(addDays(new Date(2025, 8, 1), -1))).toBe('2025-08-31')
  })

  it('formats month-day labels and durations', () => {
    expect(formatMonthDay(new Date(2025, 8, 3))).toBe('9/3')
    expect(formatDuration(37)).toBe('37초')
    expect(formatDuration(624)).toBe('10분 24초')
  })
})
