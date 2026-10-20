# 공식 스토어 배지

- `google-play-badge-ko.png`: Google Play 공식 한국어 다운로드 배지 PNG, 646 × 250. 원본 픽셀·투명 여백·비율을 유지한다.
  - 원본: https://play.google.com/intl/en_us/badges/static/images/badges/ko_badge_web_generic.png
  - 안내: https://play.google.com/intl/en-GB/console/about/brand-and-marketing/
- `app-store-badge-ko.png`: Apple 공식 한국어 블랙 배지를 778 × 240 PNG로 렌더링했다. 공식 배지의 문구·색상·외곽선·비율은 변경하지 않았다. 원본은 SVG이며 새 배지를 재구성하거나 아이콘과 텍스트를 따로 조합한 이미지가 아니다.
  - 원본: https://tools.applemediaservices.com/api/badges/download-on-the-app-store/black/ko-kr?size=250x83
  - 안내: https://developer.apple.com/kr/app-store/marketing/guidelines/
  - 변환: SVG의 표시 크기만 6배로 설정하고 macOS `sips -s format png`로 렌더링했다. viewBox와 모든 경로는 원본 그대로다.
- 취득일: 2026-10-21. 두 배지는 로컬 파일로 제공하며, 공식 스토어 다운로드 링크에 사용한다. Google Play의 포함된 여백을 자르지 않고 실제 배지 높이가 비슷하게 보이도록 CSS 표시 크기를 맞춘다.
- BADA 앱 UI 에셋과 Figma 출처는 `figma/README.md`에 기록한다.
