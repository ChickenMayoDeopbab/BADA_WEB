import { useTranslation } from '@shared/lib'
import type { SignupState } from '../model/useSignup'
import { AuthButton } from './AuthButton'
import { AuthCard } from './AuthCard'
import { AuthTextField } from './AuthTextField'
import { PasswordVisibilityButton } from './PasswordVisibilityButton'

type PasswordStepProps = {
  signup: SignupState
}

// 회원가입 두 번째 단계로 비밀번호를 설정합니다.
export const PasswordStep = ({ signup }: PasswordStepProps) => {
  const { t } = useTranslation()
  return (
    <AuthCard title={t('회원가입 · 비밀번호')} description={t('안전한 비밀번호를 설정해 주세요.')}>
      <form
        className="gap-8 flex w-full flex-col"
        onSubmit={(event) => {
          event.preventDefault()
          signup.submitPasswordStep()
        }}
        noValidate
      >
        <div className="gap-3 flex w-full flex-col">
          <AuthTextField
            label={t('비밀번호')}
            placeholder={t('비밀번호를 입력하세요.')}
            type="password"
            autoComplete="new-password"
            value={signup.password}
            onValueChange={signup.changePassword}
            error={signup.passwordError}
          />
          <AuthTextField
            label={t('비밀번호 확인')}
            placeholder={t('비밀번호를 다시 입력하세요.')}
            type={signup.isPasswordConfirmVisible ? 'text' : 'password'}
            autoComplete="new-password"
            value={signup.passwordConfirm}
            onValueChange={signup.changePasswordConfirm}
            error={signup.passwordConfirmError}
            trailing={
              <PasswordVisibilityButton
                isVisible={signup.isPasswordConfirmVisible}
                onToggle={signup.togglePasswordConfirmVisibility}
              />
            }
          />
        </div>

        <div className="gap-3 flex w-full flex-col">
          <AuthButton type="submit" label={t('다음')} />
          <AuthButton variant="secondary" label={t('이전')} onClick={signup.goToEmailStep} />
        </div>
      </form>
    </AuthCard>
  )
}
