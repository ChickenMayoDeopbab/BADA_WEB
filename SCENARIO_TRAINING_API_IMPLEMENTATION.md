# 시나리오 훈련 API 구현 및 검증

2026-10-14. 사용자가 첨부한 Spring OpenAPI 3.0.1, AI OpenAPI 3.1.0을 기준으로 현재 브랜치에 구현했다. 기존 `TrainingRecordsView.tsx` 작업은 보존했고, 백엔드와 통화 PCM/WebSocket 프로토콜은 변경하지 않았다. 새 라이브러리는 추가하지 않았다.

## 연결 범위

| 서버   | API                                                        | 연결                                                                                                                                      |
| ------ | ---------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| AI     | GET `/api/v1/scenario/scenarios`                           | 목록·카테고리·검색·기본/커스텀/공유 사본 분류, 서버 이미지 사용                                                                           |
| AI     | GET `/api/v1/scenario/recommendation`                      | 추천 시나리오 종류와 카테고리 이미지 매핑, 추천 이유 보존                                                                                 |
| AI     | GET `/api/v1/scenario/{scenario_id}/example`               | 예시 대화와 TTS 음성·파형, 최초 생성 대기 시간 지원                                                                                       |
| AI     | POST `/api/v1/scenario/custom`                             | 기존 별도 웹 체크아웃의 생성 디자인 재사용, 2단계 입력·검증·생성·오류 재시도·훈련 시작                                                    |
| AI     | DELETE `/api/v1/scenario/custom/{scenario_id}`             | 삭제 확인·실패 재시도·목록/추천 갱신, 본인 소유 가져온 사본도 삭제 가능                                                                   |
| AI     | POST `/api/v1/community/posts/{post_id}/scenario/copy`     | 공개 요청 함수 `copySharedScenario`와 캐시 갱신 훅 `useCopySharedScenario`. 커뮤니티 게시글 화면은 이 작업 범위 밖이며 아직 자리표시자다. |
| Spring | POST `/api/v1/session`                                     | 선택한 난이도·태도·시나리오 유형으로 기존 실시간 통화 연결, 선택적 최대 통화 시간 타입 지원                                               |
| Spring | POST `/api/v1/training-call-schedules`                     | 페이지를 벗어나도 유지할 예약 생성                                                                                                        |
| Spring | GET `/api/v1/training-call-schedules/ringing`              | 예약 대기 상태 조회 및 목록에 돌아왔을 때 수신 전화 복구                                                                                  |
| Spring | POST `/api/v1/training-call-schedules/{scheduleId}/accept` | 서버가 만든 세션 사용, 수락 중 중복 클릭 차단·명상 안내·통화 연결                                                                         |
| Spring | DELETE `/api/v1/training-call-schedules/{scheduleId}`      | 대기 취소·수신 거절·실패 재시도 시 이전 예약 취소                                                                                         |
| Spring | GET `/api/v1/training-records/feedback?scenarioId=...`     | 상세 패널의 최근 훈련 피드백. 이 응답은 공통 `data` 래퍼를 사용하지 않음                                                                  |
| Spring | POST `/api/v1/training-records/{sessionId}/anxiety-score`  | 점수 응답 타입·기록/추천 캐시 갱신·오류 안내. 무음/오류 등 서버가 허용하지 않는 종료에서는 제출하지 않음                                  |
| Spring | GET `/api/v1/ringtones/settings`                           | 수신 벨소리 설정 적용. 기본 벨소리는 앱 음원 재사용, 자동 재생 차단 시 켜기 버튼, 수락/거절/이동 시 정리                                  |

훈련 기록 목록·상세·삭제·녹음 재생은 기존 `features/training-records` 구현을 재사용한다. 벨소리 업로드/설정 변경은 프로필 기능이며 이번 시나리오 작업에서 새 UI를 만들지 않았다. `/internal/*`의 세션 종료·컨텍스트·데이터 삭제는 서버 간 API이므로 브라우저에서 호출하지 않는다.

## 명세와 실제 서버 차이

- Spring 공통 응답은 `NON_NULL` 직렬화다. 수신 전화가 없으면 `{ "status": 200 }`처럼 `data`가 생략된다. 이를 `null`로 정규화해 TanStack Query 오류를 막았다. 단위·브라우저 테스트에 이 응답을 포함했다.
- 예약 요청에는 `difficulty`가 없고, 서버의 예약 수락은 세션에 `null` 난이도를 전달한다. 선택한 난이도를 숨겨서 버리지 않도록 기존 페이지 대기 방식은 유지한다. 사용자가 **페이지를 벗어나도 예약 유지**를 선택하면 기본 난이도로 진행된다는 안내를 표시하고 서버 예약을 사용한다. 예약에서도 선택 난이도를 보존하려면 백엔드의 요청 DTO·예약 저장·세션 생성에 난이도 필드가 추가되어야 한다. 백엔드는 수정하지 않았다.
- 서버 예약 트리거는 기본 30초 간격이다. 카운트다운 0초에서도 실제 `RINGING` 응답이 와야 수신 버튼을 표시한다. 페이지를 닫은 상태의 브라우저 알림은 구현하지 않으며, 다시 목록을 열면 수신 중인 예약을 조회한다.
- 수락 결과를 라우트 상태로 저장할 때 페이지가 새 통화로 초기화되는 기존 키 구조를 고려해 수락 상태도 함께 저장한다.
- FastAPI 오류의 문자열 `detail`을 안내에 반영한다. 생성·예시 TTS는 최초 생성에 시간이 필요해 요청 대기 시간을 120초로 지정했다. 음성·토큰·서명된 URL을 로그에 추가하지 않았다.

확인한 서버 소스: [예약 생성·수락](https://github.com/ChickenMayoDeopbab/BADA_SPRING_SERVER/blob/9d8878d57b417d152324b7b79f434aa7239a0edd/src/main/java/ChickenMayoDeopbab/bada/domain/trainingcallschedule/service/TrainingCallScheduleService.java), [예약 트리거](https://github.com/ChickenMayoDeopbab/BADA_SPRING_SERVER/blob/9d8878d57b417d152324b7b79f434aa7239a0edd/src/main/java/ChickenMayoDeopbab/bada/domain/trainingcallschedule/service/TrainingCallScheduleTriggerService.java), [응답 직렬화](https://github.com/ChickenMayoDeopbab/BADA_SPRING_SERVER/blob/9d8878d57b417d152324b7b79f434aa7239a0edd/src/main/java/ChickenMayoDeopbab/bada/global/common/ApiResponse.java), [커스텀 소유권 검사](https://github.com/ChickenMayoDeopbab/BADA_FASTAPI_SERVER/blob/5bcc662c51e5408f04abb1c9cdb6beca4c908859/app/services/scenario_service.py).

## 검증

- 단위 테스트: 22개 파일, 93개 통과. 첨부 명세의 필드명·래퍼·생성 기본값·서버 선택·사본 상태·점수 반환·수신 없음 직렬화 등을 검사한다.
- Chromium E2E: 총 15개 통과. 기존 통화 7개 및 라우터/기록 3개에 커스텀 생성 재시도, 사본 삭제 확인과 실패 재시도, 예약 생성/수신/수락, 수신 복구/취소 재시도, 무음 종료 점수 미제출 5개를 추가했다. 새 흐름의 테스트는 서버 응답을 모의 처리하며 기존 PCM 통화 검사는 실제 브라우저 오디오 API와 가상 마이크를 사용한다.
- `npm run lint`, `npm run build`, `git diff --check`: 통과. 기존 대형 JS 번들 경고는 남아 있다. E2E 출력 디렉터리가 갱신되는 동안 lint가 이를 순회하지 않도록 `test-results`, `playwright-report`를 제외했다.

실제 로그인된 Chrome과 배포 서버에서도 다음을 별도로 확인했다.

1. 목록·추천을 읽고 `웹 검증 - 식당 예약 변경` 커스텀 시나리오를 생성했다. 실제 시나리오 ID는 110이고, 설정 화면으로 전달되는 것을 확인했다.
2. 1분 서버 예약을 생성하고 취소했다. 수신 없음의 `data` 생략 오류를 발견한 뒤 수정했다.
3. 다시 예약을 생성해 카운트다운·실제 서버 수신 전환·수락·마이크 준비 및 WebSocket 인증을 확인했다.
4. 검사 통화를 종료해 서버 `USER_END`와 정리를 확인했다. 기존 기록 화면에 커스텀 훈련 38초/피드백 1개가 저장됐다. 통화 화면은 인증 완료부터 9초를 측정했다.
5. 생성한 시나리오의 상세에서 실제 예시 대화·1분 21초 TTS 음원의 메타데이터·최근 훈련 피드백 표시를 확인했다. 스피커 청취 확인과 구분한다.

검증용 커스텀 시나리오와 통화 기록은 계정에 남겨 두었다. 실제 데이터의 영구 삭제나 사용자의 주관적 불안 점수 입력은 수행하지 않았다. 공유 시나리오 복사·삭제 및 점수 저장 실패 재시도는 모의 응답으로 검증했다. 사용자 발화와 스피커 청취 확인은 앞서 사용자가 지금 수행할 수 없다고 해 보류한 상태이며, Safari·모바일과 운영 웹 origin의 CORS는 별도 확인이 필요하다.

주요 파일은 `features/scenario-training/api/scenarioTrainingApi.ts`, `model/useCustomScenario.ts`, `model/useScenarioCall.ts`, `model/useTrainingSettings.ts`, `model/useScenarioCatalog.ts`, `model/useIncomingRingtone.ts`, 해당 `ui` 컴포넌트와 `pages/training/CustomScenarioPage.tsx`다. FSD 공개 API와 기존 인증 인터셉터를 유지했다.
