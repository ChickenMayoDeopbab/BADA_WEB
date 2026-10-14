import type { SignupState } from '../model/useSignup'
import { AuthButton } from './AuthButton'
import { AuthCard } from './AuthCard'
import { AuthTextField } from './AuthTextField'

type UsernameStepProps = {
  signup: SignupState
}

// 회원가입 마지막 단계로 이름과 아이디를 입력받습니다.
export const UsernameStep = ({ signup }: UsernameStepProps) => (
  <AuthCard
    variant="plain"
    title="회원가입 · 아이디"
    description="이름과 사용할 아이디를 입력해 주세요."
    className="min-h-[600px]"
  >
    <form
      className="flex flex-col"
      onSubmit={(event) => {
        event.preventDefault()
        void signup.submitProfileStep()
      }}
      noValidate
    >
      <div className="gap-1.5 flex flex-col">
        <AuthTextField
          variant="inset"
          label="이름"
          placeholder="이름을 입력하세요."
          autoComplete="name"
          value={signup.name}
          onValueChange={signup.changeName}
          error={signup.nameError}
        />
        <div className="gap-4 flex items-start">
          <AuthTextField
            variant="inset"
            label="아이디"
            placeholder="아이디를 입력하세요."
            autoComplete="username"
            value={signup.username}
            onValueChange={signup.changeUsername}
            error={signup.usernameError}
            success={signup.isUsernameChecked ? '사용할 수 있는 아이디입니다.' : ''}
          />
          <AuthButton
            size="small"
            label="중복 확인"
            onClick={() => void signup.confirmUsername()}
            disabled={signup.isCheckingUsername}
          />
        </div>
      </div>

      <div className="mt-8 gap-4 flex flex-col">
        <AuthButton type="submit" label="회원가입" disabled={signup.isSubmitting} />
        <AuthButton variant="secondary" label="이전으로" onClick={signup.goToPasswordStep} />
      </div>
    </form>
  </AuthCard>
)
