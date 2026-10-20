import type { DiagnosisAnswer, DiagnosisResult } from '@entities/diagnosis'

export const landingDiagnosisQuestions = [
  { questionId: 11, content: '모르는 번호로 걸려 온 전화는 의도적으로 받지 않는다.' },
  {
    questionId: 12,
    content:
      '식당 예약, 고객센터 문의, 병원 예약과 같은 공적인 전화 상황에서 특히 긴장하거나 회피하게 된다.',
  },
  { questionId: 13, content: "전화벨이 울리면 '받아야 하는데…' 하면서 망설이게 된다." },
  { questionId: 14, content: '전화를 걸기 전, 괜히 긴장되거나 부담스럽다고 느낀 적이 있다.' },
  { questionId: 15, content: '전화 대신 메시지나 카톡으로 해결할 수 있으면 그렇게 하려고 한다.' },
] as const

// 서버 CallPhobiaLevel과 같은 명칭·설명이며, 서버의 AI 요약 결과를 대신 만들지 않습니다.
export const landingDiagnosisLevels = [
  {
    levelName: '통화 안정형',
    levelDescription:
      '전화 통화에 대한 부담이 거의 없는 상태예요. 대부분의 상황에서 자연스럽게 전화를 받고 대화할 수 있으며, 돌발 상황에도 비교적 안정적으로 대응하는 편입니다.',
  },
  {
    levelName: '통화 적응형',
    levelDescription:
      '전화 통화에 약간의 긴장감은 느끼지만, 전반적으로 잘 적응하고 있는 상태예요. 익숙하지 않은 상황에서는 잠시 망설일 수 있지만, 통화를 크게 회피하지는 않습니다.',
  },
  {
    levelName: '통화 긴장형',
    levelDescription:
      '전화가 오거나 걸어야 하는 상황에서 긴장과 부담을 자주 느끼는 상태예요. 통화 전 할 말을 미리 정리하거나, 실수에 대한 걱정을 자주 하는 경향이 있습니다.',
  },
  {
    levelName: '통화 경계형',
    levelDescription:
      '전화 통화 자체를 신경 쓰고 조심하게 되는 상태예요. 벨소리나 부재중 전화에도 스트레스를 느끼며, 예상치 못한 통화 상황을 부담스럽게 받아들이는 경우가 많습니다.',
  },
  {
    levelName: '통화 회피형',
    levelDescription:
      '전화 통화에 대한 불안으로 인해 통화를 피하려는 경향이 강한 상태예요. 가능하면 문자나 메신저를 우선 사용하며, 전화 자체가 큰 스트레스와 긴장으로 이어질 수 있습니다.',
  },
] as const

type LandingDiagnosisResult = Pick<DiagnosisResult, 'score' | 'levelName' | 'levelDescription'>

/** 서버 DiagnosisService와 동일하게 응답 평균을 반올림하여 1~5단계 자가진단 결과를 구합니다. */
export const getLandingDiagnosisResult = (
  answers: readonly DiagnosisAnswer[],
): LandingDiagnosisResult => {
  if (answers.length !== landingDiagnosisQuestions.length) {
    throw new Error('자가진단의 모든 문항에 응답해야 결과를 확인할 수 있습니다.')
  }
  const score = answers.reduce<number>((sum, answer) => sum + answer, 0) / answers.length
  return { score, ...landingDiagnosisLevels[Math.round(score) - 1] }
}
