/** 5점 척도 응답 값입니다. 1은 '전혀 없다', 5는 '자주 있다'입니다. */
export type DiagnosisAnswer = 1 | 2 | 3 | 4 | 5

export interface DiagnosisQuestion {
  questionId: number
  content: string
  orderIndex: number
  questionnaireVersion?: string
}

export interface DiagnosisSubmitRequest {
  /** 같은 진단의 중복 제출을 서버가 식별하는 클라이언트 생성 값입니다. */
  sessionId: string
  type: 'SIGNUP'
  answers: DiagnosisAnswer[]
  questionnaireVersion?: string
}

export interface DiagnosisResult {
  score: number
  levelName: string
  levelDescription: string
  summary: string
}
