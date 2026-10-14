import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { TrainingRecordCalendar } from './TrainingRecordCalendar'

afterEach(cleanup)

describe('TrainingRecordCalendar', () => {
  it('기록이 있는 날짜만 선명하게 표시한다', () => {
    render(
      <TrainingRecordCalendar
        isOpen
        visibleMonth={new Date(2026, 9, 1)}
        range={{ start: new Date(2026, 9, 12), end: new Date(2026, 9, 12) }}
        recordDates={[new Date(2026, 9, 6)]}
        onCancel={vi.fn()}
        onApply={vi.fn()}
        onPreviousMonth={vi.fn()}
        onNextMonth={vi.fn()}
        onSelectDate={vi.fn()}
      />,
    )

    expect(screen.getByRole('button', { name: '2026년 10월 6일, 훈련 기록 있음' })).toHaveClass(
      'font-bold',
      'text-label-normal',
    )
    expect(screen.getByRole('button', { name: '2026년 10월 7일' })).toHaveClass(
      'text-label-disabled',
    )
  })
})
