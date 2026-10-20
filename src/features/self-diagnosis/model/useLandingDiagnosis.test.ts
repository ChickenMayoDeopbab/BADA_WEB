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
    expect(result.current.result?.levelName).toBe('많이 부담스러워요')
    act(() => result.current.restart())
    expect(result.current.step).toBe('intro')
    expect(result.current.result).toBeNull()
    act(() => result.current.start())
    expect(result.current.currentAnswer).toBeNull()
  })

  it.each([
    { answers: [1, 1, 1, 1, 1] as const, name: '가벼운 편이에요' },
    { answers: [3, 3, 3, 3, 3] as const, name: '조금 부담스러워요' },
    { answers: [5, 5, 5, 5, 5] as const, name: '많이 부담스러워요' },
  ])('응답에 따라 $name 안내를 만든다', ({ answers, name }) => {
    expect(getLandingDiagnosisResult(answers).levelName).toBe(name)
  })
})
