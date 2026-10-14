# Bada web design system

BADA 앱과 웹이 공유하는 색상, 타이포그래피, radius, effect 값을 웹 환경에 맞게 제공합니다.

새 UI에서는 숫자 팔레트보다 의미 기반 토큰을 우선 사용합니다.

```tsx
<h1 className="text-title1 font-bold text-label-normal">제목</h1>
<button className="rounded-control bg-primary-normal text-label-button-text">확인</button>
<section className="rounded-card bg-background-normal shadow-surface-card">콘텐츠</section>
```

스타일 값이 JavaScript 로직에도 필요하면 공개 API에서 가져옵니다.

```tsx
import { SEMANTIC_COLORS, TYPOGRAPHY } from '@shared/design-system'
```

## Tailwind utilities

- Color: `text-label-normal`, `bg-primary-normal`, `border-line-normal`, `bg-fill-field`
- Typography: `text-display1`, `text-display2`, `text-title1`, `text-title2`, `text-headline1`, `text-headline2`, `text-body`, `text-label`, `text-caption`
- Radius: `rounded-control`, `rounded-component`, `rounded-card`, `rounded-dialog`, `rounded-pill`
- Effect: `shadow-elevated-card`, `shadow-surface-card`, `shadow-subtle-card`

루트 요소에 `dark` 클래스를 적용하면 의미 기반 색상이 어두운 테마 값으로 전환됩니다.
