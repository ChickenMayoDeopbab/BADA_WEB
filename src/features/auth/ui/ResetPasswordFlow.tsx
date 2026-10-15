import { useResetPassword, type PasswordField } from '../model/useResetPassword'
import { AuthButton } from './AuthButton'
import { AuthCard } from './AuthCard'
import { AuthLayout } from './AuthLayout'
import { AuthTextField } from './AuthTextField'
import { EmailCodeFields } from './EmailCodeFields'
import { PasswordVisibilityButton } from './PasswordVisibilityButton'

const passwordFields: { field: PasswordField; label: string; autoComplete: string }[] = [
  { field: 'oldPassword', label: '기존 비밀번호', autoComplete: 'current-password' },
  { field: 'newPassword', label: '새 비밀번호', autoComplete: 'new-password' },
  { field: 'newPasswordConfirm', label: '새 비밀번호 확인', autoComplete: 'new-password' },
]

const passwordPlaceholders: Record<PasswordField, string> = {
  oldPassword: '기존 비밀번호를 입력하세요.',
  newPassword: '새 비밀번호를 입력하세요.',
  newPasswordConfirm: '새 비밀번호를 다시 입력하세요.',
}

// 본인 인증, 새 비밀번호 입력, 변경 완료 화면을 순서대로 보여줍니다.
export const ResetPasswordFlow = () => {
  const resetPassword = useResetPassword()

  if (resetPassword.step === 'complete') {
    return (
      <AuthLayout>
        <AuthCard
          variant="plain"
          align="center"
          title={'비밀번호 재설정'}
          description={'비밀번호가 성공적으로 변경되었습니다!'}
          className="min-h-[430px]"
        >
          <p className="mt-3.5 text-center text-body text-label-alternative">
            {'새 비밀번호로 다시 로그인해 주세요.'}
          </p>
          <div className="mt-[62px]">
            <AuthButton label={'로그인 하러가기'} onClick={resetPassword.goToLogin} />
          </div>
        </AuthCard>
      </AuthLayout>
    )
  }

  if (resetPassword.step === 'password') {
    return (
      <AuthLayout>
        <AuthCard
          variant="plain"
          title={'비밀번호 재설정'}
          description={'새로 사용할 비밀번호를 입력해 주세요.'}
          className="min-h-[690px]"
        >
          <form
            className="flex flex-col"
            onSubmit={(event) => {
              event.preventDefault()
              void resetPassword.submitPasswordStep()
            }}
            noValidate
          >
            <div className="gap-1.5 flex flex-col">
              {passwordFields.map(({ field, label, autoComplete }) => (
                <AuthTextField
                  key={field}
                  variant="inset"
                  label={label}
                  placeholder={passwordPlaceholders[field]}
                  type={resetPassword.visiblePasswords[field] ? 'text' : 'password'}
                  autoComplete={autoComplete}
                  value={resetPassword.passwords[field]}
                  onValueChange={(value) => resetPassword.changePasswordField(field, value)}
                  error={resetPassword.passwordErrors[field]}
                  trailing={
                    <PasswordVisibilityButton
                      isVisible={resetPassword.visiblePasswords[field]}
                      onToggle={() => resetPassword.togglePasswordVisibility(field)}
                    />
                  }
                />
              ))}
            </div>
            <div className="gap-4 mt-[38px] flex flex-col">
              <AuthButton
                type="submit"
                label={'비밀번호 재설정'}
                isLoading={resetPassword.isSubmitting}
              />
              <AuthButton
                variant="secondary"
                label={'이전으로'}
                onClick={resetPassword.goToVerifyStep}
              />
            </div>
          </form>
        </AuthCard>
      </AuthLayout>
    )
  }

  return (
    <AuthLayout>
      <AuthCard
        variant="plain"
        title={'비밀번호 재설정'}
        description={'가입 이메일을 인증해 주세요.'}
        className="min-h-[612px]"
      >
        <form
          className="flex flex-col"
          onSubmit={(event) => {
            event.preventDefault()
            void resetPassword.submitVerifyStep()
          }}
          noValidate
        >
          <div className="gap-1.5 flex flex-col">
            <EmailCodeFields verification={resetPassword.emailVerification} />
          </div>
          <div className="gap-4 mt-[38px] flex flex-col">
            <AuthButton
              type="submit"
              label={'다음으로'}
              isLoading={resetPassword.emailVerification.isVerifying}
            />
            <AuthButton
              variant="secondary"
              label={'아이디 찾기'}
              onClick={resetPassword.goToFindId}
            />
          </div>
        </form>
      </AuthCard>
    </AuthLayout>
  )
}
