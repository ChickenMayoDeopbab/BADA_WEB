import { useId } from 'react'

/** 브라우저 선택 박스 대신 직접 누르는 선택지를 표시하고 라디오 키보드 탐색을 유지합니다. */
export const DashboardFilterChoices = <Value extends string | number | undefined>({
  label,
  value,
  options,
  onChange,
}: {
  label: string
  value: Value
  options: Array<{ value: Value; label: string }>
  onChange: (value: Value) => void
}) => {
  const name = useId()
  return (
    <fieldset className="min-w-0">
      <legend className="mb-3 text-body font-bold text-label-normal">{label}</legend>
      <div className="gap-3 flex flex-wrap">
        {options.map((option) => (
          <label key={String(option.value)} className="relative cursor-pointer">
            <input
              type="radio"
              name={name}
              checked={value === option.value}
              onChange={() => onChange(option.value)}
              className="peer sr-only"
            />
            <span className="min-h-11 min-w-14 px-4 py-3 flex items-center justify-center rounded-control border border-line-alternative bg-background-normal text-label text-label-alternative transition-colors peer-checked:border-transparent peer-checked:bg-primary-alternative peer-checked:font-bold peer-checked:text-label-normal peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-line-normal hover:bg-fill-normal peer-checked:hover:bg-primary-alternative">
              {option.label}
            </span>
          </label>
        ))}
      </div>
    </fieldset>
  )
}
