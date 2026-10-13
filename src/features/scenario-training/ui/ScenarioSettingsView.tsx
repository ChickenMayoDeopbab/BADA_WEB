import { useTrainingSettings } from '../model/useTrainingSettings'
import type { ScenarioDifficulty, ScenarioPersonality } from '@entities/scenario'
import { IoArrowBack } from 'react-icons/io5'
import { useMinutePicker, minuteValues } from '../model/useMinutePicker'

const difficultyOptions: Array<{ value: ScenarioDifficulty; label: string }> = [
  { value: 'low', label: '하' },
  { value: 'medium', label: '중' },
  { value: 'high', label: '상' },
]

const personalityOptions: Array<{ value: ScenarioPersonality; label: string }> = [
  { value: 'KIND', label: '친절' },
  { value: 'NORMAL', label: '보통' },
  { value: 'TOUGH', label: '까다로움' },
  { value: 'RUDE', label: '진상' },
]

interface ScaleFieldProps<Value extends string> {
  label: string
  value: Value
  options: Array<{ value: Value; label: string }>
  onChange: (value: Value) => void
}

/** 앱과 동일하게 탭과 드래그를 모두 지원하는 단계 슬라이더를 표시합니다. */
const ScaleField = <Value extends string>({
  label,
  value,
  options,
  onChange,
}: ScaleFieldProps<Value>) => {
  const selectedIndex = Math.max(
    0,
    options.findIndex((option) => option.value === value),
  )
  const progress = options.length === 1 ? 0 : selectedIndex / (options.length - 1)

  return (
    <fieldset>
      <legend className="text-headline1 font-bold text-label-normal">{label}</legend>
      <div className="mt-7">
        <div className="h-8 relative">
          <span className="inset-x-0 top-1.5 h-5 absolute rounded-pill bg-fill-neutral" />
          {options.map((option, index) => (
            <span
              key={option.value}
              className="size-3 absolute top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-pill bg-line-neutral"
              style={{ left: `calc(16px + (100% - 32px) * ${index / (options.length - 1)})` }}
            />
          ))}
          <span
            className="top-0 size-8 absolute -translate-x-1/2 rounded-pill bg-background-normal shadow-elevated-card transition-[left] duration-150"
            style={{ left: `calc(16px + (100% - 32px) * ${progress})` }}
          />
          <input
            type="range"
            min={0}
            max={options.length - 1}
            step={1}
            value={selectedIndex}
            onChange={(event) => onChange(options[Number(event.target.value)].value)}
            aria-label={label}
            className="inset-0 h-8 absolute z-10 w-full cursor-pointer opacity-0"
          />
        </div>
        <div className="mt-3 flex items-center justify-between">
          {options.map((option) => {
            const isSelected = option.value === value
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => onChange(option.value)}
                className={`min-w-10 text-caption transition-colors ${
                  isSelected ? 'font-bold text-label-normal' : 'font-medium text-label-alternative'
                }`}
              >
                {option.label}
              </button>
            )
          })}
        </div>
      </div>
    </fieldset>
  )
}

interface MinuteColumnProps {
  label: string
  selected: number
  onChange: (minute: number) => void
}

/** 앱의 0~60분 스크롤 스냅 휠을 웹 상호작용으로 옮깁니다. */
const MinuteColumn = ({ label, selected, onChange }: MinuteColumnProps) => {
  const { scrollRef, handleScroll, handleSelect } = useMinutePicker(selected, onChange)

  return (
    <div className="min-w-0 flex flex-1 flex-col items-center">
      <p className="mb-3 text-label font-medium text-label-alternative">{label}</p>
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="h-[220px] w-full snap-y snap-proximity [scrollbar-width:none] overflow-y-auto overscroll-contain [&::-webkit-scrollbar]:hidden"
      >
        <div className="h-[88px]" aria-hidden="true" />
        {minuteValues.map((minute) => {
          const distance = Math.abs(minute - selected)
          const isSelected = distance === 0
          return (
            <button
              key={minute}
              type="button"
              onClick={() => handleSelect(minute)}
              className={`h-11 flex w-full snap-center items-center justify-center text-center transition-[color,opacity,font-size] ${
                isSelected
                  ? 'text-title2 font-bold text-primary-normal'
                  : distance === 1
                    ? 'text-headline1 font-medium text-label-alternative opacity-60'
                    : 'text-headline1 font-medium text-label-alternative opacity-30'
              }`}
            >
              {minute}분
            </button>
          )
        })}
        <div className="h-[88px]" aria-hidden="true" />
      </div>
    </div>
  )
}

interface MinuteRangePickerProps {
  from: number
  to: number
  onChangeFrom: (minute: number) => void
  onChangeTo: (minute: number) => void
}

/** 최소·최대 발신 시간을 하나의 선택 영역에서 조절합니다. */
const MinuteRangePicker = ({ from, to, onChangeFrom, onChangeTo }: MinuteRangePickerProps) => (
  <div className="relative">
    <span className="inset-x-0 h-11 absolute top-[120px] rounded-component bg-fill-normal" />
    <div className="relative flex items-end">
      <MinuteColumn label="최소" selected={from} onChange={onChangeFrom} />
      <span className="px-4 flex h-[220px] items-center text-headline1 font-medium text-label-alternative">
        ~
      </span>
      <MinuteColumn label="최대" selected={to} onChange={onChangeTo} />
    </div>
  </div>
)

/** Figma 2단계 훈련 설정 화면을 표시합니다. */
export const ScenarioSettingsView = () => {
  const settings = useTrainingSettings()

  if (settings.isLoading) {
    return (
      <main className="min-w-0 flex flex-1 items-center justify-center rounded-card bg-background-normal">
        <span className="size-10 animate-spin rounded-pill border-4 border-fill-alternative border-t-primary-normal" />
      </main>
    )
  }

  if (!settings.scenario) {
    return (
      <main className="min-w-0 flex flex-1 flex-col items-center justify-center rounded-card bg-background-normal text-center">
        <h1 className="text-title2 font-bold text-label-normal">시나리오를 찾지 못했어요.</h1>
        <button
          type="button"
          onClick={settings.handleBack}
          className="mt-6 h-10 px-6 rounded-control bg-primary-normal text-label font-bold text-label-strong"
        >
          목록으로 돌아가기
        </button>
      </main>
    )
  }

  return (
    <main className="min-w-0 px-10 pt-6 gap-4 flex h-[calc(100vh-32px)] flex-1 flex-col">
      <header className="h-11 gap-3.5 flex shrink-0 items-center">
        <button
          type="button"
          onClick={settings.handleBack}
          aria-label="이전"
          className="size-11 flex items-center justify-center rounded-component bg-background-normal text-label-normal"
        >
          <IoArrowBack size={24} aria-hidden="true" />
        </button>
        <h1 className="text-title1 font-bold text-label-neutral">훈련 설정</h1>
      </header>

      <section className="min-h-0 px-10 py-12 flex flex-1 items-center rounded-dialog bg-background-normal">
        <div className="mx-auto flex h-full w-[640px] flex-col">
          <div
            className="gap-2 flex"
            aria-label={`2단계 중 ${settings.step === 'level' ? 1 : 2}단계`}
          >
            <span className="h-1 flex-1 rounded-pill bg-primary-normal" />
            <span
              className={`h-1 flex-1 rounded-pill ${
                settings.step === 'time' ? 'bg-primary-normal' : 'bg-fill-alternative'
              }`}
            />
          </div>

          {settings.step === 'level' ? (
            <div className="mt-10 space-y-10">
              <ScaleField
                label="난이도"
                value={settings.difficulty}
                options={difficultyOptions}
                onChange={settings.setDifficulty}
              />
              <ScaleField
                label="상대의 태도"
                value={settings.personality}
                options={personalityOptions}
                onChange={settings.setPersonality}
              />
            </div>
          ) : (
            <div className="mt-10">
              <MinuteRangePicker
                from={settings.delayFrom}
                to={settings.delayTo}
                onChangeFrom={settings.setDelayFrom}
                onChangeTo={settings.setDelayTo}
              />
              <div className="mt-8 px-3 py-4 rounded-component bg-fill-normal">
                <p className="text-label font-medium text-label-alternative">
                  • 설정한 시간 범위 안에서 무작위로 전화가 걸려와요.
                </p>
              </div>
            </div>
          )}

          <div className="mt-auto">
            {settings.errorMessage && (
              <p className="mb-3 text-center text-caption text-status-error">
                {settings.errorMessage}
              </p>
            )}
            {settings.step === 'time' && (
              <p
                className={`mb-3 text-center text-body font-medium ${
                  settings.isDelayInvalid ? 'text-status-error' : 'text-primary-normal'
                }`}
              >
                {settings.isDelayInvalid
                  ? '최대 시간은 최소 시간보다 작을 수 없어요.'
                  : settings.delayFrom === 0 && settings.delayTo === 0
                    ? '바로 훈련이 시작돼요!'
                    : `${settings.delayFrom}분~${settings.delayTo}분 사이에 훈련이 시작돼요!`}
              </p>
            )}
            <button
              type="button"
              onClick={settings.step === 'level' ? settings.handleNext : settings.handleComplete}
              disabled={
                (settings.step === 'time' && settings.isDelayInvalid) || settings.isCreatingSession
              }
              className="h-14 w-full rounded-component bg-primary-normal text-headline2 font-bold text-common-0 disabled:cursor-not-allowed disabled:bg-fill-alternative disabled:text-label-alternative"
            >
              {settings.step === 'level'
                ? '다음으로'
                : settings.isCreatingSession
                  ? '처리 중...'
                  : '설정 완료하기'}
            </button>
          </div>
        </div>
      </section>
    </main>
  )
}
