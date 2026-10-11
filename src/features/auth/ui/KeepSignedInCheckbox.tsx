import checkIcon from '@shared/assets/auth/check.svg'
import checkboxCircle from '@shared/assets/auth/checkbox-circle.svg'

type KeepSignedInCheckboxProps = {
  checked: boolean
  onToggle: () => void
}

// Figma 체크박스 SVG를 마스크로 사용해 선택 상태에 따라 색상만 바꿉니다.
const maskStyle = (icon: string) => ({
  maskImage: `url("${icon}")`,
  WebkitMaskImage: `url("${icon}")`,
  maskRepeat: 'no-repeat',
  WebkitMaskRepeat: 'no-repeat',
  maskSize: '100% 100%',
  WebkitMaskSize: '100% 100%',
})

// 로그인 상태 유지 여부를 선택하는 체크박스입니다.
export const KeepSignedInCheckbox = ({ checked, onToggle }: KeepSignedInCheckboxProps) => {
  const iconColorClassName = checked ? 'bg-primary-normal' : 'bg-line-normal'

  return (
    <label className="h-6 gap-2 flex w-fit cursor-pointer items-center">
      <input type="checkbox" checked={checked} onChange={onToggle} className="peer sr-only" />
      <span
        className="size-6 relative flex shrink-0 items-center justify-center rounded-pill peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-label-normal"
        aria-hidden="true"
      >
        <span
          className={`inset-0 absolute ${iconColorClassName}`}
          style={maskStyle(checkboxCircle)}
        />
        <span
          className={`relative h-[10.7043px] w-[14.9918px] ${iconColorClassName}`}
          style={maskStyle(checkIcon)}
        />
      </span>
      <span className="text-label font-medium text-label-neutral">로그인 상태 유지</span>
    </label>
  )
}
