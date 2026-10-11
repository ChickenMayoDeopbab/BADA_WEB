import eyeIcon from '@shared/assets/auth/eye.svg'
import eyeOffIcon from '@shared/assets/auth/eye-off.svg'

type PasswordVisibilityButtonProps = {
  isVisible: boolean
  onToggle: () => void
}

// 비밀번호 입력값의 표시 여부를 전환합니다.
export const PasswordVisibilityButton = ({
  isVisible,
  onToggle,
}: PasswordVisibilityButtonProps) => (
  <button
    type="button"
    onClick={onToggle}
    aria-label={isVisible ? '비밀번호 숨기기' : '비밀번호 보기'}
    aria-pressed={isVisible}
    className="flex shrink-0 items-center justify-center"
  >
    <img src={isVisible ? eyeIcon : eyeOffIcon} alt="" />
  </button>
)
