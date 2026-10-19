import { LuArrowUpRight, LuPhone } from 'react-icons/lu'
import heroImage from '@shared/assets/landing/everyday-call.jpg'

/** 스크롤에 따라 문장의 강조가 변하며 연습의 의미를 전달하는 브랜드 이야기입니다. */
export const LandingStory = () => (
  <section className="landing-story" aria-labelledby="story-title" data-landing-story>
    <div className="landing-story-intro" data-reveal>
      <p className="landing-eyebrow">A LITTLE PRACTICE. A BIG DIFFERENCE.</p>
      <h2 id="story-title">
        <span data-story-line>전화가 어려운 건,</span>
        <br />
        <span data-story-line>할 말이 없어서가</span>
        <br />
        <span data-story-line>아닐 테니까.</span>
      </h2>
      <p className="landing-story-description">
        머릿속으로 수없이 연습한 대화.
        <br />
        이제는 혼자 준비하지 않아도 괜찮아요.
      </p>
    </div>
    <figure className="landing-story-photo" data-reveal>
      <img
        src={heroImage}
        alt="편안한 표정으로 일상 속 전화를 이어가는 모습"
        width="1122"
        height="1402"
        loading="lazy"
      />
      <figcaption>
        <span>
          <LuPhone aria-hidden="true" /> 익숙해지는 순간
        </span>
        <p>
          “안녕하세요.”
          <br />그 한마디가 쉬워질 때까지.
        </p>
        <a href="#practice">
          BADA와 먼저 연습해요 <LuArrowUpRight aria-hidden="true" />
        </a>
      </figcaption>
    </figure>
  </section>
)
