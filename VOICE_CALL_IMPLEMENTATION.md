# 웹 실시간 AI 통화 구현 기록

2026-10-13 기준. 작업 저장소는 `/Users/b2ong091225/Documents/ChatGPT/BADA_WEB`이며 사용자의 지시에 따라 이슈나 새 브랜치 없이 현재 브랜치에 구현했다.

## 실제 확인한 소스

| 대상        | 확인 위치 / 버전                                                                                                  | 확인 내용                                                                                                                                                                                |
| ----------- | ----------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 기존 앱     | `/Users/b2ong091225/Documents/BADA_APP`, `b2c9612cea0b495eeff87d5576dc5a26a959e511`                               | `api/trainApi.ts`, `app/start.tsx`, `app/train.tsx`, `hooks/useTrainWebSocket.ts`, `hooks/useAudio.ts`, `hooks/useTrainPlayback.ts`, `utils/trainPlayback.ts`, `public/pcm-processor.js` |
| 기존 웹 UI  | `/Users/b2ong091225/Documents/BADA_WEB`, `feat/#21-scenario-training`, `1ba8718c9ec4d3861e473cf89889a65728ad4111` | 시나리오 목록, 설정, 수신·명상·통화 화면, 불안 점수 화면, API와 디자인 자산                                                                                                              |
| AI 서버     | `ChickenMayoDeopbab/BADA_FASTAPI_SERVER`, 확인 당시 main `5bcc662c51e5408f04abb1c9cdb6beca4c908859`               | WebSocket 인증, 프레임, STT/LLM/TTS 파이프라인, 음소거와 재생 완료 처리                                                                                                                  |
| Spring 서버 | `ChickenMayoDeopbab/BADA_SPRING_SERVER`의 main 소스                                                               | `SessionController`, `CreateSessionRequest`: 세션 생성 API와 요청 필드                                                                                                                   |

현재 작업 체크아웃에는 시나리오/통화 화면이 자리표시자였다. 별도 웹 체크아웃의 구현을 필요한 범위만 가져와 기존 디자인을 유지했다. 별도 앱·웹 체크아웃과 백엔드는 수정하지 않았다. 기존 작업 트리의 `TrainingRecordsView.tsx` 변경도 수정하거나 커밋하지 않았다.

직접 읽은 서버 소스: [WebSocket 인증](https://github.com/ChickenMayoDeopbab/BADA_FASTAPI_SERVER/blob/5bcc662c51e5408f04abb1c9cdb6beca4c908859/app/api/v1/websocket.py), [프레임 규격](https://github.com/ChickenMayoDeopbab/BADA_FASTAPI_SERVER/blob/5bcc662c51e5408f04abb1c9cdb6beca4c908859/app/schemas/frames.py), [음성 파이프라인](https://github.com/ChickenMayoDeopbab/BADA_FASTAPI_SERVER/blob/5bcc662c51e5408f04abb1c9cdb6beca4c908859/app/services/pipeline.py), [STT 입력](https://github.com/ChickenMayoDeopbab/BADA_FASTAPI_SERVER/blob/5bcc662c51e5408f04abb1c9cdb6beca4c908859/app/services/stt.py), [TTS 기본 포맷](https://github.com/ChickenMayoDeopbab/BADA_FASTAPI_SERVER/blob/5bcc662c51e5408f04abb1c9cdb6beca4c908859/app/core/config.py).

## 확인한 프로토콜

- Spring: `POST /api/v1/session`, 요청은 `scenarioId`, `type: SCENARIO | CUSTOM`, `aiPersonality: KIND | NORMAL | TOUGH | RUDE`, `difficulty: low | medium | high`. 응답의 `data.sessionId`를 사용한다.
- WebSocket: 공개 AI API 주소의 `/ws/voice/{sessionId}`. Spring이 반환하는 내부 주소 `wsUrl`을 그대로 사용하지 않는 앱의 방식을 유지한다.
- 현재 서버는 첫 메시지 `{ type: 'auth', token }` 인증과 기존 앱의 `?token=...` 인증을 모두 지원한다. 기본값은 첫 메시지 인증이다. 운영 서버가 이전 버전이면 `VITE_VOICE_AUTH_MODE=query`로 기존 앱 방식을 선택할 수 있다. 실제 배포 버전은 별도 확인이 필요하다.
- 입·출력은 헤더 없는 **16kHz, 모노, signed PCM16 little-endian 바이너리**다. WAV, Opus, 브라우저 STT/TTS는 사용하지 않는다.
- 기존 앱 Worklet은 4096샘플씩 모은다. 서버는 고정 프레임 크기를 요구하지 않고 수신한 PCM을 STT 큐에 넣는다. 웹은 입력 지연을 줄이기 위해 320샘플/20ms/640바이트씩 보낸다. PCM 포맷과 서버 프레임 규격은 같다.
- 연결 후 `{ type: 'playback_capabilities', completion_ack: true }`, 30초 간격 `{ type: 'ping' }`를 보낸다.
- 서버 메시지: `scenario_info`(`aiRole`, 선택적 `scriptLevel`), `emotion`(`value`), PCM 바이너리, `speaking_end`(선택적 `turn_id`), `interrupt`, `transcript`(`role: user | ai`, `text`), `script_hint`(`level`, `text`), `notice`(`code`, `text`), `end`(`reason`), `error`(`code`), `pong`.
- `speaking_end`는 서버의 **전송 완료**다. 브라우저의 마지막 AudioBufferSource 출력 완료 후 `{ type: 'playback_done', turn_id }`를 보내며 재생 통계 `playback_stats`도 보낸다.
- `{ type: 'mute', muted: true }`는 서버가 수신 PCM을 STT 입력 큐에 넣지 않게 한다. 웹에서도 PCM 전송을 차단한다. 사용자 음소거와 AI 재생 차단을 OR로 결합하므로 AI 재생이 끝나도 사용자 음소거는 유지된다.
- 사용자 종료는 `{ type: 'end' }`다. 서버의 종료 확인 또는 정상 종료 연결 이벤트를 기다린다. 종료 확인 시간 초과는 오류이며 성공한 훈련으로 처리하지 않는다.

## 재사용과 브라우저 대체

앱에서 세션 요청, 메시지 종류, 역할별 transcript, 완료 ACK, PCM 디코딩, 250ms 초기 재생 버퍼, 다중 턴 관리, 중단 시 세대 번호로 오래된 완료 콜백 무시, 300ms 잔향 대기, 재생 backlog와 완료 watchdog을 재사용했다. 앱의 `TrainPlayback`을 웹 스타일에 맞춰 옮기고 브라우저 타이머 바인딩과 잘린 PCM 샘플 오류 처리를 보완했다.

React Native 녹음과 네이티브 오디오 큐는 `getUserMedia`, 단일 `AudioContext`, `AudioWorklet`, 순차 예약한 `AudioBufferSourceNode`로 대체했다. 실제 입력 샘플레이트에서 FIR 저역통과와 연속 리샘플링으로 16kHz PCM16을 만든다. 지원하는 브라우저에서 echo cancellation, noise suppression, auto gain control을 요청하고 제약 실패 시 기본 마이크 입력으로 다시 시도한다.

마이크는 인증·오디오 준비 후에만 활성화한다. AI `emotion`/첫 PCM부터 입력을 차단하며 모든 응답 버퍼가 완료되고 잔향 대기가 끝나야 다시 활성화한다. 차단 시 Worklet의 부분 청크도 버린다. 단일 컨텍스트를 사용하므로 AI 재생이 끝나도 마이크용 오디오 그래프를 suspend하지 않는다.

서버 연결 상태, 통화 단계, 사용자 음소거, AI 재생 차단, 브라우저 오디오 정지를 별도 상태로 관리한다. 타이머는 마이크 준비와 서버의 `scenario_info` 인증 확인이 끝난 시점에 시작한다. 예약 통화는 앱처럼 발신 직전에 세션을 생성해 긴 대기 중 세션 만료를 방지한다.

권한 거부, 장치 없음/장치 종료, 준비 및 인증 시간 초과, 서버 오류, 비정상 종료, 토큰 만료, 잘린 PCM, 출력 실패, 과도한 송신 대기, 자동 재생/오디오 정지를 처리한다. 오디오 정지는 사용자 클릭으로 재개할 수 있다. 종료, 페이지 이동, pagehide, StrictMode 정리에서는 트랙·노드·컨텍스트·소켓·큐·타이머·리스너와 늦은 비동기 응답을 정리한다.

## 주요 변경 파일

| 영역                        | 파일                                                                                                                                                                    |
| --------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 도메인 및 라우트 전달       | `src/entities/scenario/model/types.ts`, `index.ts`                                                                                                                      |
| REST 요청                   | `src/features/scenario-training/api/scenarioTrainingApi.ts`                                                                                                             |
| 마이크와 재생 드라이버      | `model/voiceAudio.ts`, `model/pcmProcessor.worklet.js`                                                                                                                  |
| 재사용한 재생 제어기        | `model/trainPlayback.ts`                                                                                                                                                |
| WebSocket 규격과 연결       | `model/voiceProtocol.ts`, `model/voiceTransport.ts`                                                                                                                     |
| 통화 상태와 UI 명령         | `model/voiceCall.ts`, `model/useScenarioCall.ts`, `model/callErrors.ts`                                                                                                 |
| 기존 훈련 흐름 연결         | `model/useScenarioCatalog.ts`, `model/useScenarioExampleAudio.ts`, `model/useTrainingSettings.ts`, `model/useMinutePicker.ts`, `model/useTrainingResult.ts`             |
| 기존 웹 UI                  | `ui/ScenarioTrainingView.tsx`, `ui/ScenarioSettingsView.tsx`, `ui/ScenarioCallView.tsx`, `ui/ScenarioResultView.tsx`, 필요한 `src/shared/assets/scenario-training` 자산 |
| 페이지와 Public API         | `src/pages/training/*`, `src/features/scenario-training/index.ts`, `src/app/providers/RouterProvider.tsx`                                                               |
| 인증                        | `src/features/auth/model/getValidAccessToken.ts`, `api/configureAuthHttpClient.ts`, `index.ts`                                                                          |
| 디자인 토큰·기존 애니메이션 | `src/shared/design-system/colors.ts`, `theme.css`, `src/app/styles/index.css`                                                                                           |
| 설정                        | `.env.example`, `src/shared/config/env.ts`, `vitest.config.ts`, `playwright.config.ts`                                                                                  |
| 검증                        | 오디오·재생·연결·통화 제어·토큰 갱신 단위 테스트, `tests/e2e/voice-call.spec.ts`, 기존 인증 테스트와 캘린더 E2E 선택자 보정                                             |

인증 토큰 취득 함수를 페이지에서 주입해 서로 다른 feature slice 간 import를 피했다. Spring과 AI HTTP 클라이언트 및 WebSocket이 단일 갱신 Promise를 공유한다. BADA API와 다른 origin에는 토큰을 첨부하지 않는다. 토큰과 연결 URL을 로그에 기록하지 않는다. 새 라이브러리는 추가하지 않았다.

## 실행과 검증

`.env.example`을 참고해 Spring과 공개 AI API URL을 설정하고 로그인한 뒤 `/training`에서 시나리오를 선택한다. 운영에서는 HTTPS 웹과 HTTPS AI API/WSS가 필요하다. 마이크와 AudioWorklet은 보안 컨텍스트가 필요하며 localhost는 개발에 사용할 수 있다. [MDN AudioWorklet](https://developer.mozilla.org/en-US/docs/Web/API/AudioWorklet).

수행한 검증:

- `npm run lint`: 통과.
- `npm run build`: TypeScript 검사 및 Vite 빌드 통과. Worklet이 별도 정적 JS 자산으로 출력된다. 메인 JS의 500kB 초과 경고는 남아 있다.
- `npm run test:run`: 20개 파일, 79개 테스트 통과.
- `npm run test:e2e -- --reporter=list`: Chromium 10개 테스트 통과(통화 7개, 기존 라우터·기록 3개).
- `git diff --check`: 통과.

브라우저 통화 테스트는 모의 REST/WebSocket 서버와 Chromium 가상 마이크를 사용한다. **getUserMedia, AudioContext, AudioWorklet, PCM 변환과 실제 재생 스케줄러는 대체하지 않는다.** 여러 PCM 청크의 출력 완료 전 ACK가 없고, 출력 완료와 잔향 대기 동안 입력이 차단되며, 사용자 음소거가 유지되는 것을 검사한다. 같은 SPA에서 재훈련, 권한 거부, 페이지 이동, 브라우저 오디오 suspend/resume, 비정상 서버 종료, 예약 시점 세션 생성, 결과 점수 저장 실패 후 재시도를 검사한다.

## 운영에서 추가 확인할 사항

운영 계정의 인증된 세션, 실제 사용자 음성의 서버 STT, AI 응답과 실제 TTS 수신, 최종 훈련 기록/피드백 저장까지는 이 환경에서 검증하지 않았다. 모의 서버 테스트를 실제 서버 성공으로 해석하면 안 된다. 물리적 마이크·스피커의 에코와 Bluetooth 출력 지연, Safari/Firefox/모바일 브라우저에서도 직접 통화 확인이 필요하다.

배포 서버의 첫 auth 메시지 지원 여부, 웹 origin의 CORS 허용, WSS 프록시·인증 설정, 사용자 정보 처리 동의를 확인해야 한다. 서버 프로토콜 변경이나 백엔드 수정은 필요하지 않았다.

명상 영상 및 커스텀 시나리오 생성 라우트는 기존 구현 상태를 유지한다. 실시간 서버의 STT/TTS와 브라우저 SpeechRecognition/speechSynthesis를 혼용하지 않는다.
