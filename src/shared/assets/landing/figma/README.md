# BADA 앱 디자인 에셋

출처: [Bada | UI 디자인](https://www.figma.com/design/KGuo11S9PSP6t3MyVjidTT/Bada?node-id=5932-8139).

- `5932:8139`: AI 통화 화면, 아바타 원본과 통화·도움말 아이콘
- `5932:8231`: 시나리오 선택 화면, 상태 표시줄과 앱 하단 메뉴 아이콘
- `5932:8425`: 훈련 리포트, 타임라인·오디오 파형·재생 위치·손뼉 아이콘

Figma 디자인 컨텍스트가 제공한 원본 에셋을 로컬에 저장했습니다. 화면 전체를 캡처한 이미지는 사용하지 않으며, `AppScreen.tsx`와 `appScreen.css`에서 402×874 레이아웃을 구현합니다. SVG는 원본 너비·높이를 유지하고 화면 전체를 비례 축소합니다.

동일한 파일은 기존 `scenario-training` 에셋(추천 이미지, 업무·일상·학교·기타 이미지)과 `training-records/audio-marker.svg`를 재사용합니다. 임시 Figma 에셋 URL은 런타임에서 사용하지 않습니다.
