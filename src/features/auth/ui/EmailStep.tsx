import type { SignupState } from '../model/useSignup'
import { AuthButton } from './AuthButton'
import { AuthCard } from './AuthCard'
import { AuthTextField } from './AuthTextField'

type EmailStepProps = {
  signup: SignupState
}

// 회원가입 첫 단계로 사용할 이메일을 인증합니다.
export const EmailStep = ({ signup }: EmailStepProps) => {
  const { emailVerification } = signup

  return (
    <AuthCard title="회원가입 · 이메일" description="사용할 이메일을 인증해 주세요.">
      <form
        className="gap-8 flex w-full flex-col"
        onSubmit={(event) => {
          event.preventDefault()
          void signup.submitEmailStep()
        }}
        noValidate
      >
        <div className="gap-3 flex w-full flex-col">
          <AuthTextField
            label="이메일"
            placeholder="이메일을 입력하세요."
            type="email"
            autoComplete="email"
            value={emailVerification.email}
            onValueChange={emailVerification.changeEmail}
            error={emailVerification.emailError}
            success={emailVerification.isSent ? '인증코드가 전송되었습니다.' : ''}
          />
          <AuthTextField
            label="인증번호"
            placeholder="인증번호를 입력하세요."
            inputMode="numeric"
            autoComplete="one-time-code"
            value={emailVerification.authCode}
            onValueChange={emailVerification.changeAuthCode}
            error={emailVerification.authCodeError}
          />
        </div>

        <div className="gap-3 flex w-full flex-col">
          <AuthButton
            label={emailVerification.isSent ? '인증번호 다시 받기' : '인증번호 받기'}
            onClick={() => void emailVerification.sendCode()}
            isLoading={emailVerification.isSending}
          />
          <AuthButton
            type="submit"
            variant="secondary"
            label="다음"
            isLoading={emailVerification.isVerifying}
          />
        </div>
      </form>
    </AuthCard>
  )
}
