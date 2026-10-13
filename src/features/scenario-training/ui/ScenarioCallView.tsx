import { useScenarioCall } from '../model/useScenarioCall'
import callAnswer from '@shared/assets/scenario-training/call-answer.svg'
import callAvatar from '@shared/assets/scenario-training/call-avatar.png'
import callDecline from '@shared/assets/scenario-training/call-decline.svg'
import callEnd from '@shared/assets/scenario-training/call-end.svg'
import callKeypad from '@shared/assets/scenario-training/call-keypad.svg'
import callMicOff from '@shared/assets/scenario-training/call-mic-off.svg'
import callRecord from '@shared/assets/scenario-training/call-record.svg'
import callScript from '@shared/assets/scenario-training/call-script.svg'
import callSpeaker from '@shared/assets/scenario-training/call-speaker.svg'
import callVideo from '@shared/assets/scenario-training/call-video.svg'
import { IoCall } from 'react-icons/io5'

const formatTimer = (seconds: number) => {
  const minutes = Math.floor(seconds / 60)
  return `${String(minutes).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`
}

interface ContactProps {
  title: string
}

const Contact = ({ title }: ContactProps) => (
  <div className="flex flex-col items-center text-center">
    <h1 className="text-display1 font-bold text-label-normal">{title}</h1>
    <p className="mt-2 text-body font-medium text-label-alternative">바다 AI</p>
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
export const ScenarioCallView = () => {
  const call = useScenarioCall()
  const title = call.scenario?.title ?? '시나리오 훈련'

  if (call.stage === 'meditationVideo') {
    return (
      <main className="min-h-screen flex items-center justify-center bg-background-normal">
        <button
          type="button"
          onClick={call.handleStartCall}
          aria-label="명상을 마치고 통화 시작"
          className="h-[540px] w-[960px] flex items-center justify-center rounded-dialog bg-fill-normal text-headline1 font-bold text-neutral-70"
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
        <div className="h-[calc(100vh-104px)] flex flex-col items-center justify-between">
          <p className="text-body font-medium text-label-alternative">바다 시나리오 훈련</p>
          <Contact title={title} />
          {call.stage === 'scheduled' ? (
            <div className="text-center">
              <p className="text-caption text-label-alternative">전화가 걸려오기까지</p>
              <p className="mt-2 text-title2 font-bold tabular-nums text-label-normal">
                {formatTimer(call.remainingDelay)}
              </p>
              <button
                type="button"
                onClick={call.handleDecline}
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
                aria-label="전화 받기"
                className="size-20 flex items-center justify-center rounded-pill bg-green-40"
              >
                <img src={callAnswer} alt="" className="size-9" />
              </button>
              <button
                type="button"
                onClick={call.handleDecline}
                aria-label="전화 거절"
                className="size-20 flex items-center justify-center rounded-pill bg-red-40"
              >
                <img src={callDecline} alt="" className="size-9 rotate-[135deg]" />
              </button>
            </div>
          )}
        </div>

        {call.stage === 'meditationPrompt' && (
          <div className="inset-0 fixed z-10 flex items-center justify-center bg-common-100/30">
            <section
              role="dialog"
              aria-modal="true"
              className="w-[460px] p-8 rounded-dialog bg-background-normal shadow-elevated-card"
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

  const isEnded = call.stage === 'ended'

  return (
    <main
      className={`px-12 pb-14 pt-12 ease-out grid min-h-screen bg-gradient-to-b from-background-normal to-train-call-gradient-end transition-[grid-template-columns,gap] duration-300 motion-reduce:transition-none ${
        call.isScriptOpen
          ? 'gap-6 grid-cols-[minmax(360px,1fr)_minmax(320px,min(42vw,620px))]'
          : 'gap-0 grid-cols-[minmax(0,1fr)_0px]'
      }`}
    >
      <section className="min-w-0 ease-out flex flex-col items-center justify-between transition-transform duration-300 motion-reduce:transition-none">
        <div
          className={`gap-2 flex items-center text-label font-bold tabular-nums ${
            isEnded ? 'text-status-error' : 'text-label-normal'
          }`}
        >
          <IoCall size={16} className={isEnded ? 'rotate-[135deg]' : ''} aria-hidden="true" />
          <span className={isEnded ? 'animate-pulse motion-reduce:animate-none' : undefined}>
            {formatTimer(call.elapsedSeconds)}
          </span>
          {isEnded && <span>훈련을 종료했습니다.</span>}
        </div>

        <div className="gap-8 flex flex-col items-center">
          <Contact title={title} />
          {!isEnded && (
            <div className="gap-x-2 gap-y-5 grid grid-cols-3">
              <CallControl
                icon={callScript}
                label="스크립트 보기"
                active={call.isScriptOpen}
                onClick={call.handleToggleScript}
              />
              <CallControl
                icon={callMicOff}
                label="음소거"
                active={call.isMuted}
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
          disabled={isEnded}
          aria-label="통화 종료"
          className={`size-20 flex shrink-0 items-center justify-center rounded-pill ${
            isEnded ? 'bg-red-80' : 'bg-red-40'
          }`}
        >
          <img src={callEnd} alt="" className="size-9 rotate-[135deg]" />
        </button>
      </section>

      <aside
        aria-hidden={!call.isScriptOpen || isEnded}
        className={`min-w-0 ease-out h-[calc(100vh-104px)] overflow-hidden rounded-dialog bg-background-normal transition-[opacity,transform] duration-300 motion-reduce:transition-none ${
          call.isScriptOpen && !isEnded
            ? 'translate-x-0 opacity-100'
            : 'translate-x-6 pointer-events-none opacity-0'
        }`}
      >
        <div className="p-8 min-w-0 h-full flex flex-col">
          <h2 className="text-headline1 font-bold text-label-normal">예시 스크립트</h2>
          <div className="mt-7 min-h-0 flex-1 overflow-y-auto pr-3">
            {call.isScriptLoading && (
              <p className="py-8 text-center text-body text-label-alternative">
                스크립트를 불러오는 중입니다.
              </p>
            )}
            {!call.isScriptLoading && call.scriptErrorMessage && (
              <p className="py-8 text-center text-body text-status-error">
                {call.scriptErrorMessage}
              </p>
            )}
            {!call.isScriptLoading && !call.scriptErrorMessage && call.script.length > 0 && (
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
            {!call.isScriptLoading && !call.scriptErrorMessage && call.script.length === 0 && (
              <div className="p-4 rounded-component bg-primary-alternative">
                <p className="leading-6 text-label whitespace-pre-wrap text-label-normal">
                  {call.scenario?.content ?? '표시할 예시 스크립트가 없습니다.'}
                </p>
              </div>
            )}
          </div>
        </div>
      </aside>
    </main>
  )
}
