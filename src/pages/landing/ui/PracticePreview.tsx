import { previewDifficulties, previewPersonalities } from '../model/practicePreview'
import { usePracticePreview } from '../model/usePracticePreview'
import { AppScreen } from './AppScreen'
import './practicePreview.css'

/** 선택한 조건이 실제 Figma 앱 화면에 반영되는 짧은 훈련 설정 미리보기입니다. */
export const PracticePreview = () => {
  const { selection, selectOption } = usePracticePreview()
  return (
    <section id="practice" className="brand-practice" aria-labelledby="practice-title">
      <div className="brand-practice-inner">
        <div className="brand-practice-copy">
          <p className="brand-kicker">훈련 설정 미리보기</p>
          <h2 id="practice-title">
            처음엔 가볍게.
            <br />
            익숙해지면 한 걸음 더.
          </h2>
          <p>
            난이도와 상대의 태도를 바꿔보세요.
            <br />
            연습도 내 속도에 맞출 수 있어요.
          </p>
          <div className="brand-practice-options">
            <fieldset>
              <legend>난이도</legend>
              <div>
                {previewDifficulties.map((label, index) => (
                  <button
                    key={label}
                    type="button"
                    aria-pressed={selection.difficulty === index}
                    onClick={() => selectOption('difficulty', index)}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </fieldset>
            <fieldset>
              <legend>상대의 태도</legend>
              <div>
                {previewPersonalities.map((label, index) => (
                  <button
                    key={label}
                    type="button"
                    aria-pressed={selection.personality === index}
                    onClick={() => selectOption('personality', index)}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </fieldset>
          </div>
          <p className="sr-only" role="status">
            난이도 {previewDifficulties[selection.difficulty]}, 상대의 태도{' '}
            {previewPersonalities[selection.personality]} 선택됨
          </p>
        </div>
        <div className="brand-practice-visual">
          <div className="brand-practice-phone" data-practice-phone>
            <AppScreen variant="settings" settings={selection} />
          </div>
        </div>
      </div>
    </section>
  )
}
