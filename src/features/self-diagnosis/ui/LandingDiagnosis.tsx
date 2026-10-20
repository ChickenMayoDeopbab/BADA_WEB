import { LuArrowUpRight, LuRotateCcw } from 'react-icons/lu'
import { useSelfDiagnosis } from '../model/useSelfDiagnosis'
import { AnswerScale } from './AnswerScale'
import './landingDiagnosis.css'

/** 로그인 없이 LANDING 문항 조회·응답 제출·서버 결과 확인을 한 영역에서 진행합니다. */
export const LandingDiagnosis = () => {
  const diagnosis = useSelfDiagnosis('LANDING')
  const { step, currentQuestion, questionsStatus, result } = diagnosis

  return (
    <section id="diagnosis" className="landing-diagnosis" aria-labelledby="landing-diagnosis-title">
      <div className="landing-diagnosis-heading">
        <p>콜포비아 자가진단</p>
        <h2 id="landing-diagnosis-title">
          전화 앞에서,
          <br />내 마음은 어떤가요.
        </h2>
        <p>
          간단한 질문으로 나의 통화불안을 살펴보세요.
          <br />
          로그인 없이 진행할 수 있어요.
        </p>
      </div>
      <div className="landing-diagnosis-panel">
        {step === 'intro' && (
          <div className="landing-diagnosis-intro">
            <p>
              정답은 없어요.
              <br />
              평소 나의 모습에 가까운 답을 골라주세요.
            </p>
            <button
              className="landing-diagnosis-action"
              type="button"
              onClick={() => void diagnosis.start()}
            >
              자가진단 시작하기 <LuArrowUpRight aria-hidden="true" />
            </button>
          </div>
        )}
        {step === 'question' && (
          <>
            {questionsStatus === 'success' && currentQuestion ? (
              <>
                <div className="landing-diagnosis-question-top">
                  <button type="button" onClick={diagnosis.goBack} aria-label="이전 문항으로">
                    이전
                  </button>
                  <span aria-label="문항 진행">
                    {diagnosis.currentIndex + 1} / {diagnosis.totalCount}
                  </span>
                </div>
                <h3
                  className="landing-diagnosis-question"
                  aria-live="polite"
                  key={currentQuestion.questionId}
                >
                  {currentQuestion.content}
                </h3>
                <AnswerScale
                  name={`landing-diagnosis-${currentQuestion.questionId}`}
                  value={diagnosis.currentAnswer}
                  onChange={diagnosis.selectAnswer}
                />
                <button
                  className="landing-diagnosis-action landing-diagnosis-next"
                  type="button"
                  disabled={diagnosis.currentAnswer == null}
                  onClick={diagnosis.goNext}
                >
                  {diagnosis.currentIndex === diagnosis.totalCount - 1
                    ? '결과 확인하기'
                    : '다음 문항'}{' '}
                  <LuArrowUpRight aria-hidden="true" />
                </button>
              </>
            ) : questionsStatus === 'pending' ? (
              <p role="status">문항을 불러오는 중이에요.</p>
            ) : (
              <div className="landing-diagnosis-state">
                <p role="alert">
                  {questionsStatus === 'error'
                    ? '문항을 불러오지 못했어요.'
                    : '현재 진행할 문항이 없어요.'}
                </p>
                <button
                  type="button"
                  className="landing-diagnosis-action"
                  onClick={diagnosis.retryQuestions}
                >
                  다시 불러오기
                </button>
              </div>
            )}
          </>
        )}
        {step === 'submitting' && <p role="status">응답을 바탕으로 결과를 확인하고 있어요.</p>}
        {step === 'error' && (
          <div className="landing-diagnosis-state">
            <p role="alert">{diagnosis.errorMessage}</p>
            <button
              type="button"
              className="landing-diagnosis-action"
              onClick={diagnosis.retrySubmit}
            >
              다시 시도하기
            </button>
          </div>
        )}
        {step === 'result' && result && (
          <div className="landing-diagnosis-result" aria-live="polite">
            <p>나의 자가진단 결과</p>
            <h3>{result.levelName}</h3>
            <p>{result.levelDescription}</p>
            <p>{result.summary}</p>
            <div className="landing-diagnosis-result-actions">
              <a className="landing-diagnosis-action" href="#download">
                앱으로 시작하기 <LuArrowUpRight aria-hidden="true" />
              </a>
              <button type="button" onClick={diagnosis.restart}>
                <LuRotateCcw aria-hidden="true" /> 다시 해보기
              </button>
            </div>
          </div>
        )}
      </div>
    </section>
  )
}
