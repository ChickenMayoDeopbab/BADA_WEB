import { useIdLogin } from '../model/useIdLogin'
import { AuthButton } from './AuthButton'
import { AuthCard } from './AuthCard'
import { AuthLayout } from './AuthLayout'
import { AuthTextField } from './AuthTextField'
import { KeepSignedInCheckbox } from './KeepSignedInCheckbox'
import { PasswordVisibilityButton } from './PasswordVisibilityButton'

// 아이디와 비밀번호로 로그인하는 화면입니다.
export const IdLogin = () => {
  const login = useIdLogin()

  return (
    <AuthLayout>
      <AuthCard title="아이디로 로그인" description="Bada 계정으로 서비스를 시작하세요.">
        <form className="gap-8 flex w-full flex-col" onSubmit={login.submit} noValidate>
          <div className="gap-3 flex w-full flex-col">
            <AuthTextField
              label="아이디"
              placeholder="아이디를 입력하세요."
              name="username"
              autoComplete="username"
              value={login.username}
              onValueChange={login.changeUsername}
              error={login.usernameError}
            />
            <AuthTextField
              label="비밀번호"
              placeholder="비밀번호를 입력하세요."
              name="password"
              type={login.isPasswordVisible ? 'text' : 'password'}
              autoComplete="current-password"
              value={login.password}
              onValueChange={login.changePassword}
              error={login.passwordError}
              trailing={
                <PasswordVisibilityButton
                  isVisible={login.isPasswordVisible}
                  onToggle={login.togglePasswordVisibility}
                />
              }
            />
            <KeepSignedInCheckbox
              checked={login.keepSignedIn}
              onToggle={login.toggleKeepSignedIn}
            />
          </div>

          <div className="gap-3 flex w-full flex-col">
            <AuthButton type="submit" label="로그인" disabled={login.isSubmitting} />
            <AuthButton variant="secondary" label="회원가입" onClick={login.goToSignup} />
            <div className="gap-4 flex text-label font-medium text-label-neutral">
              <button type="button" onClick={login.goToFindId}>
                아이디 찾기
              </button>
              <button type="button" onClick={login.goToResetPassword}>
                비밀번호 찾기
              </button>
            </div>
          </div>
        </form>
      </AuthCard>
    </AuthLayout>
  )
}
