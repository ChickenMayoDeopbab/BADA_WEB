/** 긴장된 선이 원으로 닫히고 문장에 색이 차오르는 전환 장면입니다. */
export const LandingStory = () => (
  <section className="brand-manifesto" data-manifesto aria-labelledby="manifesto-title">
    <p className="brand-kicker">01 / 마음의 준비</p>
    <svg className="brand-manifesto-orbit" viewBox="0 0 800 500" aria-hidden="true">
      <ellipse data-orbit-stroke cx="400" cy="250" rx="370" ry="200" pathLength="1" />
    </svg>
    <div className="brand-manifesto-type">
      <h2 id="manifesto-title">
        잘 말하는 것보다,
        <br />
        편하게 시작하는 것.
      </h2>
      <p data-manifesto-ink aria-hidden="true">
        잘 말하는 것보다,
        <br />
        편하게 시작하는 것.
      </p>
    </div>
    <div className="brand-manifesto-bottom">
      <span>완벽한 첫마디는 없어도 괜찮아요.</span>
      <p>
        상대는 AI니까. 준비될 때까지 기다릴 수 있으니까.
        <br />
        틀려도, 멈춰도, 다시 시작해도 괜찮은 곳.
      </p>
    </div>
  </section>
)
