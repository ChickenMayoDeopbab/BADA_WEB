import { LuArrowUpRight } from 'react-icons/lu'
import { routePaths } from '@shared/config'
import { WebStartLink } from './WebStartLink'
import heroImage from '@shared/assets/landing/everyday-call.jpg'

/** 짧은 연습과 자가진단을 서로 다른 크기의 에디토리얼 요소로 안내합니다. */
export const PracticePaths = () => (
  <>
    <section id="warmup" className="brand-warmup" aria-labelledby="warmup-title">
      <div className="brand-warmup-time" aria-hidden="true">
        30<span>초</span>
      </div>
      <div className="brand-warmup-copy">
        <p className="brand-kicker">04 / 첫마디부터 천천히</p>
        <h2 id="warmup-title">
          오늘은, 인사만
          <br />
          꺼내봐도 충분해요.
        </h2>
        <p>
          긴 통화가 아직 부담스럽다면
          <br />
          짧은 워밍업으로 가볍게 시작해보세요.
        </p>
        <WebStartLink destination={routePaths.trainingWarmup}>워밍업 시작하기</WebStartLink>
        <div className="brand-diagnosis">
          <p>내 마음이 먼저 궁금하다면?</p>
          <WebStartLink destination={routePaths.welcome}>자가진단으로 나를 알아보기</WebStartLink>
        </div>
      </div>
    </section>
    <section className="brand-life" aria-labelledby="life-title">
      <figure data-life-photo>
        <img
          src={heroImage}
          alt="창가에서 편안하게 일상 속 전화를 이어가는 모습"
          width="1122"
          height="1402"
          loading="lazy"
        />
        <figcaption>연습이 일상이 되는 순간 / BADA</figcaption>
      </figure>
      <div className="brand-life-caption">
        <p className="brand-kicker">
          SMALL PRACTICE.
          <br />
          EVERYDAY COURAGE.
        </p>
        <h2 id="life-title">
          연습은 여기서.
          <br />
          <span>용기는 일상에서.</span>
        </h2>
      </div>
    </section>
    <section className="brand-community" aria-labelledby="community-title">
      <div>
        <p className="brand-kicker">05 / 함께하는 연습</p>
        <h2 id="community-title">
          “나도 그랬어.”
          <br />그 한마디의 힘.
        </h2>
      </div>
      <div>
        <p>
          나만 그런 줄 알았던 마음.
          <br />
          비슷한 경험을 나누고,
          <br />
          서로의 작은 시도를 응원해요.
        </p>
        <WebStartLink destination={routePaths.community}>커뮤니티 둘러보기</WebStartLink>
        <LuArrowUpRight className="brand-community-arrow" aria-hidden="true" />
      </div>
    </section>
  </>
)
