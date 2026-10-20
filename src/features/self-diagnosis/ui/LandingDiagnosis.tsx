import { LuArrowUpRight, LuRotateCcw } from 'react-icons/lu'
import resultHelp from '@shared/assets/landing/figma/0df77.svg'
import resultLine from '@shared/assets/landing/figma/77781.svg'
import { useLandingDiagnosis } from '../model/useLandingDiagnosis'
import { AnswerScale } from './AnswerScale'
import './landingDiagnosis.css'

/** 서버와 인증에 연결하지 않는 랜딩용 간단 체크를 표시합니다. */
export const LandingDiagnosis = () => {
  const diagnosis = useLandingDiagnosis()
  const { step, currentQuestion, result } = diagnosis

  return (
    <section id="diagnosis" className="landing-diagnosis" aria-labelledby="landing-diagnosis-title">
      <div className="landing-diagnosis-inner">
        <div className="landing-diagnosis-heading">
          <div>
            <p>콜포비아 자가진단</p>
            <h2 id="landing-diagnosis-title">
              전화 앞에서,
              <br />내 마음은 어떤가요.
            </h2>
          </div>
          <p className="landing-diagnosis-count">
            <strong>05</strong>
            <span>개의 짧은 질문</span>
          </p>
        </div>
        <div className="landing-diagnosis-panel">
          <div className="landing-diagnosis-progress" aria-hidden="true">
            {Array.from({ length: diagnosis.totalCount }, (_, index) => (
              <span
                key={index}
                data-complete={
                  step === 'result' || (step === 'question' && index <= diagnosis.currentIndex)
                }
              />
            ))}
          </div>
          {step === 'intro' && (
            <div className="landing-diagnosis-intro">
              <p>
                모르는 번호가 뜨면,
                <br />
                잠깐 망설여지나요?
              </p>
              <p className="landing-diagnosis-intro-description">
                평소 나의 모습에 가까운 답을 골라주세요.
              </p>
              <button
                className="landing-diagnosis-action"
                type="button"
                onClick={() => void diagnosis.start()}
              >
                자가진단 시작하기 <LuArrowUpRight aria-hidden="true" />
              </button>
              <span className="landing-diagnosis-note">로그인 없이 · 답변 저장 없이</span>
            </div>
          )}
          {step === 'question' && (
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
          )}
          {step === 'result' && result && (
            <div
              className="landing-diagnosis-result"
              aria-live="polite"
              data-figma-node="4966:5319"
            >
              <p>나의 통화 부담은?</p>
              <div className="landing-diagnosis-result-title">
                <h3>{result.levelName}</h3>
                <div className="landing-diagnosis-result-help">
                  <button
                    type="button"
                    aria-label="레벨 설명 보기"
                    aria-describedby="landing-diagnosis-level-description"
                  >
                    <img src={resultHelp} alt="" />
                  </button>
                  <p id="landing-diagnosis-level-description" role="tooltip">
                    {result.levelDescription}
                  </p>
                </div>
              </div>
              <img className="landing-diagnosis-result-line" src={resultLine} alt="" />
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
      </div>
    </section>
  )
}
