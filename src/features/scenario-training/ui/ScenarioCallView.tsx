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
  compact?: boolean
}

const Contact = ({ title, compact = false }: ContactProps) => (
  <div className="flex flex-col items-center text-center">
    <h1 className="text-display1 font-bold text-label-normal">
      {title}
    </h1>
    <p className="mt-2 text-body font-medium text-label-alternative">바다 AI</p>
    <img
      src={callAvatar}
      alt="AI 통화 상대"
      className={`${compact ? 'mt-8' : 'mt-8'} size-[140px] rounded-pill object-cover`}
    />
  </div>
)

interface CallControlProps {
  icon: string
  label: string
  active?: boolean
  onClick?: () => void
}

const CallControl = ({ icon, label, active = false, onClick }: CallControlProps) => (
  <button type="button" onClick={onClick} className="w-24 flex flex-col items-center">
    <span
      className={`size-16 flex items-center justify-center rounded-pill ${
        active ? 'bg-primary-alternative' : 'bg-background-normal/70'
      }`}
    >
      <img src={icon} alt="" className="size-7 object-contain" />
    </span>
    <span className="mt-2 text-label font-medium text-label-neutral">{label}</span>
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
    <main className="gap-12 min-h-screen px-12 pb-14 pt-12 flex bg-gradient-to-b from-background-normal to-train-call-gradient-end">
      <section className="min-w-0 flex flex-1 flex-col items-center justify-between">
        <div
          className={`gap-2 flex items-center text-label font-bold tabular-nums ${
            isEnded ? 'text-status-error' : 'text-label-normal'
          }`}
        >
          <IoCall size={16} className={isEnded ? 'rotate-[135deg]' : ''} aria-hidden="true" />
          <span>{formatTimer(call.elapsedSeconds)}</span>
          {isEnded && <span>훈련을 종료했습니다.</span>}
        </div>

        <div className="gap-8 flex flex-col items-center">
          <Contact title={title} compact={call.isScriptOpen} />
          {!isEnded && !call.isScriptOpen && (
          <div className="gap-x-10 gap-y-6 grid grid-cols-3">
            <CallControl
              icon={callScript}
              label="스크립트 보기"
              active={call.isScriptOpen}
              onClick={() => call.setIsScriptOpen(true)}
            />
            <CallControl
              icon={callMicOff}
              label="음소거"
              active={call.isMuted}
              onClick={() => call.setIsMuted(!call.isMuted)}
            />
            <CallControl
              icon={callRecord}
              label="녹음"
              active={call.isRecording}
              onClick={() => call.setIsRecording(!call.isRecording)}
            />
            <CallControl
              icon={callSpeaker}
              label="스피커"
              active={call.isSpeakerOn}
              onClick={() => call.setIsSpeakerOn(!call.isSpeakerOn)}
            />
            <CallControl icon={callVideo} label="영상통화" />
            <CallControl icon={callKeypad} label="키패드" />
          </div>
          )}

          {!isEnded && call.isScriptOpen && (
          <button
            type="button"
            onClick={() => call.setIsScriptOpen(false)}
            className="h-11 w-[178px] rounded-component bg-background-normal text-body font-medium text-label-neutral"
          >
            스크립트 가리기
          </button>
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

      {call.isScriptOpen && !isEnded && (
        <aside className="h-[calc(100vh-104px)] w-[620px] shrink-0 p-8 rounded-dialog bg-background-normal">
          <h2 className="text-headline1 font-bold text-label-normal">스크립트</h2>
          <div className="mt-7">
            <p className="text-caption font-bold text-label-alternative">통화 목표</p>
            <div className="mt-2 p-4 rounded-component bg-primary-alternative">
              <p className="leading-6 whitespace-pre-wrap text-label text-label-normal">
                {call.scenario?.content}
              </p>
            </div>
          </div>
        </aside>
      )}
    </main>
  )
}
