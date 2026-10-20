import { LuArrowUpRight, LuPlus } from 'react-icons/lu'
import { landingQuestions } from '../model/landingContent'
import { landingLinks } from '../model/landingLinks'
import './landingFaq.css'

/** 시작 전 필요한 답과 팀 문의 동선을 간결한 질문 목록으로 제공합니다. */
export const LandingFaq = () => (
  <section id="faq" className="brand-faq" aria-labelledby="faq-title">
    <header className="brand-faq-heading">
      <h2 id="faq-title">자주 묻는 질문</h2>
      <a href={landingLinks.support}>
        팀에 물어보기 <LuArrowUpRight aria-hidden="true" />
      </a>
    </header>
    <div className="brand-faq-list">
      {landingQuestions.map(({ question, answer }, index) => (
        <details key={question}>
          <summary>
            <span className="brand-faq-number" aria-hidden="true">
              {String(index + 1).padStart(2, '0')}
            </span>
            <span>{question}</span>
            <LuPlus aria-hidden="true" />
          </summary>
          <p>{answer}</p>
        </details>
      ))}
    </div>
  </section>
)
