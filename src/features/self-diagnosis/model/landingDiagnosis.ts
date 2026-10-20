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

/** 랜딩 체험의 다섯 응답 평균으로 간단한 통화 부담 안내를 만듭니다. */
export const getLandingDiagnosisResult = (answers: readonly DiagnosisAnswer[]): DiagnosisResult => {
  const score = answers.reduce<number>((sum, answer) => sum + answer, 0) / answers.length
  if (score < 2.5) {
    return {
      score,
      levelName: '가벼운 편이에요',
      levelDescription: '대체로 전화에 대한 부담이 크지 않은 편으로 답했어요.',
      summary: '낯선 상황에서도 편하게 말할 수 있도록, 새로운 상황을 가볍게 연습해보세요.',
    }
  }
  if (score < 3.5) {
    return {
      score,
      levelName: '조금 부담스러워요',
      levelDescription: '상황에 따라 전화가 망설여지는 편으로 답했어요.',
      summary: '자주 마주치는 전화 상황부터, 친절한 상대와 차근차근 연습해보세요.',
    }
  }
  return {
    score,
    levelName: '많이 부담스러워요',
    levelDescription: '전화를 앞두고 부담을 느끼는 일이 잦은 편으로 답했어요.',
    summary: '처음부터 잘할 필요는 없어요. 부담이 덜한 상황과 낮은 난이도부터 천천히 시작해보세요.',
  }
}
