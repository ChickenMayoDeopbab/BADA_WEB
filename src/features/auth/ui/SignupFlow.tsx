import { useSignup } from '../model/useSignup'
import { AuthLayout } from './AuthLayout'
import { EmailStep } from './EmailStep'
import { PasswordStep } from './PasswordStep'
import { UsernameStep } from './UsernameStep'

// 회원가입 단계를 순서대로 보여줍니다.
export const SignupFlow = () => {
  const signup = useSignup()

  return (
    <AuthLayout>
      {signup.step === 'email' && <EmailStep signup={signup} />}
      {signup.step === 'password' && <PasswordStep signup={signup} />}
      {signup.step === 'profile' && <UsernameStep signup={signup} />}
    </AuthLayout>
  )
}
