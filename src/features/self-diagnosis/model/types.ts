/** 자가진단 화면 단계입니다. */
export type SelfDiagnosisStep = 'intro' | 'question' | 'submitting' | 'done' | 'result' | 'error'

/** 민감정보 동의 확인 상태입니다. */
export type ConsentStatus = 'idle' | 'checking' | 'required' | 'saving'
