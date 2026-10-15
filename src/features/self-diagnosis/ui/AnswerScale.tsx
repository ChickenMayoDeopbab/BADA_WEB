import { useTranslation } from '@shared/lib'
import type { DiagnosisAnswer } from '@entities/diagnosis'

type AnswerScaleProps = {
  name: string
  value: DiagnosisAnswer | null
  onChange: (answer: DiagnosisAnswer) => void
}

const options: { value: DiagnosisAnswer; label: string; sizeClassName: string }[] = [
  { value: 1, label: '전혀 없다', sizeClassName: 'size-16' },
  { value: 2, label: '', sizeClassName: 'size-14' },
  { value: 3, label: '보통이다', sizeClassName: 'size-12' },
  { value: 4, label: '', sizeClassName: 'size-14' },
  { value: 5, label: '자주 있다', sizeClassName: 'size-16' },
]

// 문항에 대한 5점 척도 응답을 고르는 라디오 그룹입니다. 양 끝으로 갈수록 원이 커집니다.
export const AnswerScale = ({ name, value, onChange }: AnswerScaleProps) => {
  const { t } = useTranslation()
  return (
    <fieldset className="px-4 max-sm:px-0 flex w-full justify-between">
      <legend className="sr-only">{t('응답 선택 (1: 전혀 없다, 5: 자주 있다)')}</legend>
      {options.map((option) => (
        <label
          key={option.value}
          className="gap-3 max-sm:w-12 flex w-[72px] cursor-pointer flex-col items-center"
        >
          <input
            type="radio"
            name={name}
            value={option.value}
            checked={value === option.value}
            onChange={() => onChange(option.value)}
            aria-label={option.label || `${option.value}점`}
            className="peer sr-only"
          />
          <span className="size-16 max-sm:size-12 flex items-center justify-center rounded-pill peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-primary-normal">
            <span
              className={`max-sm:border-4 max-sm:max-h-full max-sm:max-w-full flex items-center justify-center rounded-pill border-[6px] transition-colors ${option.sizeClassName} ${
                value === option.value
                  ? 'border-primary-normal'
                  : 'border-line-neutral hover:border-line-normal'
              }`}
            >
              {value === option.value && (
                <span className="size-[56%] rounded-pill bg-primary-normal" />
              )}
            </span>
          </span>
          <span
            aria-hidden
            className={`min-h-[18px] text-label ${
              value === option.value
                ? 'font-bold text-label-normal'
                : 'font-medium text-label-alternative'
            }`}
          >
            {option.label}
          </span>
        </label>
      ))}
    </fieldset>
  )
}
