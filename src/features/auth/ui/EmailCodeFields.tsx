import type { EmailVerification } from '../model/useEmailVerification'
import { AuthButton } from './AuthButton'
import { AuthTextField } from './AuthTextField'

type EmailCodeFieldsProps = {
  verification: EmailVerification
}

// 이메일 입력, 인증코드 전송 버튼, 인증코드 입력 필드를 함께 보여줍니다.
export const EmailCodeFields = ({ verification }: EmailCodeFieldsProps) => {
  return (
    <>
      <div className="gap-4 flex items-start">
        <AuthTextField
          variant="inset"
          label={'이메일'}
          placeholder={'이메일을 입력하세요.'}
          type="email"
          autoComplete="email"
          value={verification.email}
          onValueChange={verification.changeEmail}
          error={verification.emailError}
          success={verification.isSent ? '인증코드가 전송되었습니다.' : ''}
        />
        <AuthButton
          size="small"
          label={verification.isSent ? '다시 전송' : '인증코드 전송'}
          onClick={() => void verification.sendCode()}
          isLoading={verification.isSending}
        />
      </div>
      <AuthTextField
        variant="inset"
        label={'인증코드'}
        placeholder={'인증코드를 입력하세요.'}
        inputMode="numeric"
        autoComplete="one-time-code"
        value={verification.authCode}
        onValueChange={verification.changeAuthCode}
        error={verification.authCodeError}
      />
    </>
  )
}
