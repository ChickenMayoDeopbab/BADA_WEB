import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import type { BiosignalReportView } from '../model/types'
import { BiosignalReportCard } from './BiosignalReportCard'

const view: BiosignalReportView = {
  heart: {
    chart: {
      binSec: 5,
      startSec: -5,
      values: [72, 80, null, 90, 94, 86, 80, 76],
      phases: [
        'anticipation',
        'listen',
        'listen',
        'speak',
        'speak',
        'listen',
        'recovery',
        'recovery',
      ],
    },
    callChange: '통화하는 동안 심박이 평소보다 조금 빨랐어요.',
    peak: { atSec: 47, phase: 'speak', bpm: 94.2 },
    recoveryPct: 63,
    sentence: '몸은 반응했지만 목소리는 끝까지 안정적이었어요.',
    baselineBpm: 72.4,
  },
  eda: { chart: null, callChangePct: 12.4, risesPerMin: 2.5 },
  skinTemp: { callMeanC: 33.12, callDeltaC: -0.24 },
}

describe('BiosignalReportCard', () => {
  afterEach(cleanup)

  it('심박 흐름·피부전도·손목 피부 온도와 의료 판단이 아니라는 안내를 보여 준다', () => {
    render(<BiosignalReportCard view={view} />)

    expect(screen.getByRole('heading', { name: '몸의 반응' })).toBeInTheDocument()
    expect(screen.getByText('통화하는 동안 심박이 평소보다 조금 빨랐어요.')).toBeInTheDocument()
    expect(
      screen.getByRole('img', { name: '통화 전부터 끊은 뒤까지의 심박 흐름 그래프' }),
    ).toBeInTheDocument()
    expect(screen.getByText('0:47 · 내가 말할 때')).toBeInTheDocument()
    expect(screen.getByText('평소 쪽으로 63% 돌아왔어요')).toBeInTheDocument()
    expect(screen.getByText('+12%')).toBeInTheDocument()
    expect(screen.getByText('1분에 2.5번')).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: '손목 피부 온도' })).toBeInTheDocument()
    expect(screen.getByText('33.1°C')).toBeInTheDocument()
    expect(screen.getByText('−0.2°C')).toBeInTheDocument()
    expect(screen.getByText(/의료적 판단이나 진단이 아니에요/)).toBeInTheDocument()
  })

  it('절대 심박은 펼쳐야 보인다', () => {
    render(<BiosignalReportCard view={view} />)
    const toggle = screen.getByRole('button', { name: '심박 숫자' })
    const panel = document.getElementById(toggle.getAttribute('aria-controls') ?? '')

    expect(toggle).toHaveAttribute('aria-expanded', 'false')
    expect(panel).toHaveAttribute('aria-hidden', 'true')

    fireEvent.click(toggle)

    expect(toggle).toHaveAttribute('aria-expanded', 'true')
    expect(panel).toHaveAttribute('aria-hidden', 'false')
    expect(screen.getByText('72 bpm')).toBeInTheDocument()
    expect(screen.getByText('94 bpm')).toBeInTheDocument()
  })

  it('값이 없는 구역은 숨긴다', () => {
    render(<BiosignalReportCard view={{ ...view, eda: null, skinTemp: null }} />)

    expect(screen.queryByRole('heading', { name: '피부전도' })).not.toBeInTheDocument()
    expect(screen.queryByRole('heading', { name: '손목 피부 온도' })).not.toBeInTheDocument()
  })
})
