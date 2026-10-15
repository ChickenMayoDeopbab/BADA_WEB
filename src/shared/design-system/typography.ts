/** Bada에서 사용하는 기본 글꼴입니다. */
export const FONT_FAMILY = 'Pretendard Variable'

/** Bada 타이포그래피의 글꼴 굵기입니다. */
export const FONT_WEIGHT = {
  regular: 400,
  medium: 500,
  bold: 700,
} as const

/** 모든 단계에 130% 행간과 -2% 자간을 적용한 타이포그래피 체계입니다. */
export const TYPOGRAPHY = {
  display1: { fontSize: '36px', lineHeight: '46.8px', letterSpacing: '-0.72px' },
  display2: { fontSize: '32px', lineHeight: '41.6px', letterSpacing: '-0.64px' },
  title1: { fontSize: '28px', lineHeight: '36.4px', letterSpacing: '-0.56px' },
  title2: { fontSize: '24px', lineHeight: '31.2px', letterSpacing: '-0.48px' },
  headline1: { fontSize: '20px', lineHeight: '26px', letterSpacing: '-0.4px' },
  headline2: { fontSize: '18px', lineHeight: '23.4px', letterSpacing: '-0.36px' },
  body: { fontSize: '16px', lineHeight: '20.8px', letterSpacing: '-0.32px' },
  label: { fontSize: '14px', lineHeight: '18.2px', letterSpacing: '-0.28px' },
  caption: { fontSize: '12px', lineHeight: '15.6px', letterSpacing: '-0.24px' },
} as const
