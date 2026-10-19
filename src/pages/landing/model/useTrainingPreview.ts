import { useState } from 'react'
import { previewScenarios } from './landingContent'

/** 시나리오 선택과 예시 대화 진행을 서버 요청 없이 관리합니다. */
export const useTrainingPreview = () => {
  const [scenarioIndex, setScenarioIndex] = useState(0)
  const [visibleTurns, setVisibleTurns] = useState(2)
  const [isFeedbackVisible, setIsFeedbackVisible] = useState(false)
  const scenario = previewScenarios[scenarioIndex]

  /** 새 상황을 선택하면 대화 예시를 처음부터 표시합니다. */
  const selectScenario = (index: number) => {
    setScenarioIndex(index)
    setVisibleTurns(2)
    setIsFeedbackVisible(false)
  }

  /** 다음 대화를 보여준 뒤 피드백 예시로 이동합니다. */
  const advancePreview = () => {
    if (isFeedbackVisible) {
      setVisibleTurns(2)
      setIsFeedbackVisible(false)
    } else if (visibleTurns < scenario.dialogue.length) {
      setVisibleTurns(scenario.dialogue.length)
    } else {
      setIsFeedbackVisible(true)
    }
  }

  return {
    scenario,
    scenarioIndex,
    visibleTurns,
    isFeedbackVisible,
    selectScenario,
    advancePreview,
  }
}
