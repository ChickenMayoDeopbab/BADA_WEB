import { act, renderHook } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { useLandingDiagnosis } from './useLandingDiagnosis'
import { getLandingDiagnosisResult } from './landingDiagnosis'

describe('useLandingDiagnosis', () => {
  it('라우터·인증·서버 제공자 없이 바로 문항을 시작하고 미응답 진행을 막는다', () => {
    const { result } = renderHook(() => useLandingDiagnosis())
    act(() => result.current.start())
    expect(result.current.step).toBe('question')
    expect(result.current.totalCount).toBe(5)
    act(() => result.current.goNext())
    expect(result.current.currentIndex).toBe(0)
  })

  it('이전 응답을 유지하고 다섯 응답이 끝나면 기다리지 않고 결과를 보여준다', () => {
    const { result } = renderHook(() => useLandingDiagnosis())
    act(() => result.current.start())
    act(() => result.current.selectAnswer(2))
    act(() => result.current.goNext())
    act(() => result.current.selectAnswer(4))
    act(() => result.current.goBack())
    expect(result.current.currentAnswer).toBe(2)
    act(() => result.current.goNext())
    expect(result.current.currentAnswer).toBe(4)
    for (let index = 1; index < 5; index++) {
      act(() => result.current.selectAnswer(4))
      act(() => result.current.goNext())
    }
    expect(result.current.step).toBe('result')
    expect(result.current.result?.score).toBe(3.6)
    expect(result.current.result?.levelName).toBe('통화 경계형')
    act(() => result.current.restart())
    expect(result.current.step).toBe('intro')
    expect(result.current.result).toBeNull()
    act(() => result.current.start())
    expect(result.current.currentAnswer).toBeNull()
  })

  it.each([
    { answers: [1, 1, 1, 1, 1] as const, name: '통화 안정형' },
    { answers: [2, 2, 2, 2, 2] as const, name: '통화 적응형' },
    { answers: [3, 3, 3, 3, 3] as const, name: '통화 긴장형' },
    { answers: [4, 4, 4, 4, 4] as const, name: '통화 경계형' },
    { answers: [5, 5, 5, 5, 5] as const, name: '통화 회피형' },
    { answers: [1, 1, 1, 2, 2] as const, name: '통화 안정형' },
    { answers: [1, 1, 2, 2, 2] as const, name: '통화 적응형' },
    { answers: [2, 2, 2, 3, 3] as const, name: '통화 적응형' },
    { answers: [2, 2, 3, 3, 3] as const, name: '통화 긴장형' },
    { answers: [3, 3, 3, 4, 4] as const, name: '통화 긴장형' },
    { answers: [3, 3, 4, 4, 4] as const, name: '통화 경계형' },
    { answers: [4, 4, 4, 5, 5] as const, name: '통화 경계형' },
    { answers: [4, 4, 5, 5, 5] as const, name: '통화 회피형' },
  ])('서버와 같은 평균 반올림으로 $name 결과를 계산한다 ($answers)', ({ answers, name }) => {
    expect(getLandingDiagnosisResult(answers).levelName).toBe(name)
    expect(getLandingDiagnosisResult(answers)).not.toHaveProperty('summary')
  })

  it('일부 문항만 응답한 상태에서는 결과를 만들지 않는다', () => {
    expect(() => getLandingDiagnosisResult([])).toThrow('모든 문항')
    expect(() => getLandingDiagnosisResult([1, 2, 3, 4])).toThrow('모든 문항')
  })
})
