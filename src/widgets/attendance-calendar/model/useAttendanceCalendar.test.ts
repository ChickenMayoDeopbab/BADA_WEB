import { getCalendarWeeks } from './useAttendanceCalendar'
import { describe, expect, it } from 'vitest'

describe('getCalendarWeeks', () => {
  it('splits a month into Sunday-first weeks with leading and trailing blanks', () => {
    const weeks = getCalendarWeeks(2026, 8).map((week) =>
      week.map((date) => date?.getDate() ?? null),
    )

    expect(weeks).toHaveLength(5)
    expect(weeks[0]).toEqual([null, null, 1, 2, 3, 4, 5])
    expect(weeks[4]).toEqual([27, 28, 29, 30, null, null, null])
  })
})
