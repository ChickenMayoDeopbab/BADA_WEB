import { useScenarioCall, type ScenarioCallOptions } from '../model/useScenarioCall'
import { useCallScriptScroll } from '../model/useCallScriptScroll'
import { ScriptHintBar } from './ScriptHintBar'
import callAnswer from '@shared/assets/scenario-training/call-answer.svg'
import callAvatar from '@shared/assets/scenario-training/call-avatar.png'
import callDecline from '@shared/assets/scenario-training/call-decline.svg'
import callEnd from '@shared/assets/scenario-training/call-end.svg'
import callEndedStatus from '@shared/assets/scenario-training/call-ended-status.svg'
import callKeypad from '@shared/assets/scenario-training/call-keypad.svg'
import callMicOff from '@shared/assets/scenario-training/call-mic-off.svg'
import callRecord from '@shared/assets/scenario-training/call-record.svg'
import callScript from '@shared/assets/scenario-training/call-script.svg'
import callSpeaker from '@shared/assets/scenario-training/call-speaker.svg'
import callVideo from '@shared/assets/scenario-training/call-video.svg'
import { IoCall } from 'react-icons/io5'

/** 초 단위 통화 시간을 분:초로 표시합니다. */
const formatTimer = (seconds: number) => {
  const minutes = Math.floor(seconds / 60)
  return `${String(minutes).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`
}

interface ContactProps {
  title: string
}

/** 기존 통화 상대 정보와 아바타를 표시합니다. */
const Contact = ({ title }: ContactProps) => (
  <div className="flex flex-col items-center text-center">
    <h1 className="text-display1 font-bold text-label-normal">{title}</h1>
    <img
      src={callAvatar}
      alt="AI 통화 상대"
      className="mt-8 size-[140px] rounded-pill object-cover"
    />
  </div>
)

interface CallControlProps {
  icon: string
  label: string
  active?: boolean
  disabled?: boolean
  onClick?: () => void
}

/** 통화 제어 버튼의 활성·비활성 상태를 표시합니다. */
const CallControl = ({
  icon,
  label,
  active = false,
  disabled = false,
  onClick,
}: CallControlProps) => (
  <button
    type="button"
    onClick={onClick}
    disabled={disabled}
    aria-pressed={disabled ? undefined : active}
    className="w-24 flex flex-col items-center disabled:cursor-not-allowed"
  >
    <span
      className={`flex size-[72px] items-center justify-center rounded-dialog transition-colors ${
        active ? 'bg-primary-alternative' : 'bg-background-normal/70'
      }`}
    >
      <img
        src={icon}
        alt=""
        className={`size-8 object-contain transition-opacity ${disabled ? 'opacity-40' : ''}`}
      />
    </span>
    <span
      className={`mt-2 text-label font-medium text-label-neutral transition-opacity ${
        disabled ? 'opacity-40' : ''
      }`}
    >
      {label}
    </span>
  </button>
)

/** Figma 수신·명상·통화·종료 화면을 표시합니다. */
export const ScenarioCallView = (options: ScenarioCallOptions) => {
  const call = useScenarioCall(options)
  const scriptScrollRef = useCallScriptScroll(call.isScriptOpen, call.script)
  const title = call.scenario?.title ?? '시나리오 훈련'

  if (!call.hasSession || call.stage === 'error') {
    return (
      <main className="gap-6 p-8 flex min-h-screen flex-col items-center justify-center bg-background-normal">
        <Contact title={title} />
        <p role="alert" className="max-w-xl text-center text-body text-status-error">
          {call.errorMessage || '통화 세션 정보가 없어요. 훈련 설정에서 새 통화를 시작해 주세요.'}
        </p>
        <div className="gap-4 flex">
          <button
            type="button"
            onClick={call.handleRetry}
            className="px-6 py-3 rounded-component bg-primary-normal text-body font-bold text-label-button-text"
          >
            새 훈련 시작
          </button>
          <button
            type="button"
            onClick={call.handleDecline}
            className="px-6 py-3 rounded-component bg-fill-normal text-body text-label-normal"
          >
            목록으로 돌아가기
          </button>
        </div>
      </main>
    )
  }

  if (call.stage === 'meditationVideo') {
    return (
      <main className="flex min-h-screen items-center justify-center bg-background-normal">
        <button
          type="button"
          onClick={call.handleStartCall}
          aria-label="명상을 마치고 통화 시작"
          className="flex h-[540px] w-[960px] items-center justify-center rounded-dialog bg-fill-normal text-headline1 font-bold text-neutral-70"
        >
          (명상영상)
        </button>
      </main>
    )
  }

  if (
    call.stage === 'scheduled' ||
    call.stage === 'incoming' ||
    call.stage === 'meditationPrompt'
  ) {
    return (
      <main className="px-12 pt-12 pb-14 relative min-h-screen overflow-hidden bg-gradient-to-b from-background-normal to-train-call-gradient-end">
        <div className="flex h-[calc(100vh-104px)] flex-col items-center justify-between">
          <p className="text-body font-medium text-label-alternative">바다 시나리오 훈련</p>
          <Contact title={title} />
          {call.stage === 'scheduled' ? (
            <div className="text-center">
              <p className="text-caption text-label-alternative">전화가 걸려오기까지</p>
              <p className="mt-2 text-title2 font-bold text-label-normal tabular-nums">
                {formatTimer(call.remainingDelay)}
              </p>
              {call.remainingDelay === 0 && (
                <p role="status" className="mt-2 text-body text-label-alternative">
                  {call.schedule
                    ? '예약 전화의 수신을 기다리고 있어요.'
                    : '통화 세션을 준비하고 있어요.'}
                </p>
              )}
              <button
                type="button"
                onClick={call.handleDecline}
                disabled={call.isCanceling}
                className="mt-5 text-caption text-label-alternative"
              >
                훈련 취소하기
              </button>
            </div>
          ) : (
            <div className="gap-40 flex items-center">
              <button
                type="button"
                onClick={call.handleAnswer}
                disabled={call.isAccepting || call.isCanceling}
                aria-label="전화 받기"
                className="size-20 flex items-center justify-center rounded-pill bg-green-40"
              >
                <img src={callAnswer} alt="" className="size-9" />
              </button>
              <button
                type="button"
                onClick={call.handleDecline}
                disabled={call.isAccepting || call.isCanceling}
                aria-label="전화 거절"
                className="size-20 flex items-center justify-center rounded-pill bg-red-40"
              >
                <img src={callDecline} alt="" className="size-9 rotate-[135deg]" />
              </button>
            </div>
          )}
          {call.isAccepting && (
            <p role="status" className="text-body text-label-alternative">
              예약 전화를 수락하고 있어요.
            </p>
          )}
          {call.isRingtoneBlocked && (
            <button
              type="button"
              onClick={() => void call.handlePlayRingtone()}
              className="text-label text-primary-normal"
            >
              벨소리 켜기
            </button>
          )}
        </div>

        {call.stage === 'meditationPrompt' && (
          <div className="inset-0 fixed z-10 flex items-center justify-center bg-common-100/30">
            <section
              role="dialog"
              aria-modal="true"
              className="p-8 w-[460px] rounded-dialog bg-background-normal shadow-elevated-card"
            >
              <h2 className="text-headline2 font-bold text-label-normal">훈련 전 명상을 할까요?</h2>
              <p className="mt-2 text-body text-label-alternative">
                명상은 통화 전 마음을 안정시키는 데 도움이 돼요.
              </p>
              <div className="mt-6 gap-3 flex">
                <button
                  type="button"
                  onClick={call.handleStartCall}
                  className="h-[52px] flex-1 rounded-component bg-background-alternative text-body font-bold text-label-neutral"
                >
                  건너뛰기
                </button>
                <button
                  type="button"
                  onClick={call.handleMeditate}
                  className="h-[52px] flex-1 rounded-component bg-primary-normal text-body font-bold text-common-0"
                >
                  명상하기
                </button>
              </div>
            </section>
          </div>
        )}
      </main>
    )
  }

  const isWaitingForResult = call.stage === 'ending' || call.stage === 'ended'
  const isScriptVisible = call.isScriptOpen && !isWaitingForResult
  const isActive = call.stage === 'active'
  const statusMessage =
    call.stage === 'preparing'
      ? call.isMicrophonePending
        ? '브라우저에서 마이크 사용을 허용해 주세요.'
        : '마이크를 준비하고 있어요.'
      : call.stage === 'connecting'
        ? '통화 서버에 연결하고 있어요.'
        : call.isAudioSuspended
          ? '음성 활성화 버튼을 눌러 주세요.'
          : call.isMuted
            ? '마이크가 음소거되어 있어요.'
            : call.isPlaybackBlocked
              ? '상대방이 말하고 있어요.'
              : '편하게 말씀해 주세요.'

  return (
    <main
      aria-busy={isWaitingForResult}
      className={`px-12 pb-14 pt-12 ease-out grid min-h-screen ${
        isWaitingForResult
          ? 'bg-background-normal'
          : 'bg-gradient-to-b from-background-normal to-train-call-gradient-end transition-[grid-template-columns,gap] duration-300 motion-reduce:transition-none'
      } ${
        isScriptVisible
          ? 'gap-6 grid-cols-[minmax(360px,1fr)_minmax(320px,min(42vw,620px))]'
          : 'gap-0 grid-cols-[minmax(0,1fr)_0px]'
      }`}
    >
      <section className="min-w-0 ease-out flex flex-col items-center justify-between transition-transform duration-300 motion-reduce:transition-none">
        <div
          className={`gap-2 flex items-center tabular-nums ${
            isWaitingForResult
              ? 'text-body font-medium text-red-40'
              : 'text-label font-bold text-label-normal'
          }`}
        >
          {isWaitingForResult ? (
            <img src={callEndedStatus} alt="" className="size-5 rotate-[135deg]" />
          ) : (
            <IoCall size={16} aria-hidden="true" />
          )}
          <span
            className={isWaitingForResult ? 'animate-pulse motion-reduce:animate-none' : undefined}
          >
            {formatTimer(call.elapsedSeconds)}
          </span>
          {isWaitingForResult && (
            <span role="status" className="sr-only">
              훈련 결과 대기 중
            </span>
          )}
        </div>

        <div className="gap-8 flex flex-col items-center">
          <Contact title={call.displayName || title} />
          {!isWaitingForResult && (
            <p role="status" className="text-body text-label-alternative">
              {statusMessage}
            </p>
          )}
          {call.notice && !isWaitingForResult && (
            <p role="status" className="max-w-lg text-center text-label text-label-alternative">
              {call.notice}
            </p>
          )}
          {call.isAudioSuspended && !isWaitingForResult && (
            <button
              type="button"
              onClick={call.handleResumeAudio}
              className="px-6 py-3 rounded-component bg-primary-normal text-body font-bold text-label-button-text"
            >
              음성 활성화
            </button>
          )}
          {!isWaitingForResult && (
            <div className="gap-x-2 gap-y-5 grid grid-cols-3">
              <CallControl
                icon={callScript}
                label="스크립트 보기"
                active={call.isScriptOpen}
                disabled={!isActive}
                onClick={call.handleToggleScript}
              />
              <CallControl
                icon={callMicOff}
                label="음소거"
                active={call.isMuted}
                disabled={!isActive}
                onClick={call.handleToggleMute}
              />
              <CallControl icon={callRecord} label="녹음" active={call.isRecording} disabled />
              <CallControl icon={callSpeaker} label="스피커" active={call.isSpeakerOn} disabled />
              <CallControl icon={callVideo} label="영상통화" disabled />
              <CallControl icon={callKeypad} label="키패드" disabled />
            </div>
          )}
        </div>

        <button
          type="button"
          onClick={call.handleEndCall}
          disabled={isWaitingForResult}
          aria-label="통화 종료"
          className={`size-20 flex shrink-0 items-center justify-center rounded-pill ${
            isWaitingForResult ? 'bg-red-80' : 'bg-red-40'
          }`}
        >
          <img src={callEnd} alt="" className="size-9 rotate-[135deg]" />
        </button>
      </section>

      <aside
        aria-hidden={!isScriptVisible}
        className={`min-w-0 ease-out h-[calc(100vh-104px)] overflow-hidden rounded-dialog bg-background-normal transition-[opacity,transform] duration-300 motion-reduce:transition-none ${
          isWaitingForResult
            ? 'hidden'
            : isScriptVisible
              ? 'translate-x-0 opacity-100'
              : 'translate-x-6 pointer-events-none opacity-0'
        }`}
      >
        <div className="p-8 min-w-0 flex h-full flex-col">
          <div className="gap-3 flex items-center justify-between">
            <h2 className="text-headline1 font-bold text-label-normal">실시간 대화 스크립트</h2>
            <button
              type="button"
              onClick={call.handleToggleScript}
              tabIndex={isScriptVisible ? 0 : -1}
              className="px-3 py-2 shrink-0 rounded-control bg-fill-normal text-label font-medium text-label-neutral"
            >
              스크립트 가리기
            </button>
          </div>
          <div ref={scriptScrollRef} className="mt-7 min-h-0 pr-3 flex-1 overflow-y-auto">
            {call.script.length > 0 && (
              <ol className="gap-6 flex flex-col">
                {call.script.map((turn, index) => (
                  <li
                    key={`${turn.speaker}-${index}`}
                    className={`leading-7 text-body font-medium whitespace-pre-wrap ${
                      turn.speaker === 'user' ? 'text-label-normal' : 'text-label-alternative'
                    }`}
                  >
                    <strong className="font-bold">
                      {turn.speaker === 'user' ? '나' : '상대방'} :{' '}
                    </strong>
                    {turn.text}
                  </li>
                ))}
              </ol>
            )}
            {call.script.length === 0 && (
              <div className="p-4 rounded-component bg-primary-alternative">
                <p className="leading-6 text-label whitespace-pre-wrap text-label-normal">
                  대화를 시작하면 내 발화와 상대방의 응답이 여기에 표시됩니다.
                </p>
              </div>
            )}
          </div>
          <ScriptHintBar hint={call.scriptHint} />
        </div>
      </aside>
    </main>
  )
}
