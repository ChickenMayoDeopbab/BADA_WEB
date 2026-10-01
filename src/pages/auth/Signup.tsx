import { EmailStep, PasswordStep, UsernameStep } from '@features/auth'
import { routePaths } from '@shared/config'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

export default function SignupScreen() {
  const [step, setStep] = useState(1)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [username, setUsername] = useState('')
  const navigate = useNavigate()

  const handleSignup = async () => {
    navigate(routePaths.welcome)
  }

  return (
    <div className="p-10 h-screen w-screen bg-[#F5F5F5]">
      <div className="w-full">
        <img src="src/shared/assets/badaLogo2.svg" style={{ width: 100 }} />
      </div>
      <div className="flex h-full w-full items-center justify-center">
        <div className="bg-white rounded-xl p-10 flex h-[80%] w-[35%] flex-col shadow-[0px_0px_15px_rgba(0,0,0,0.1)]">
          <div className="mb-10 flex flex-1 items-center">
            <h1 className="text-3xl font-bold text-[#0D0D0E]">회원가입</h1>
          </div>

          {step === 1 && (
            <UsernameStep username={username} setUsername={setUsername} onNext={() => setStep(2)} />
          )}

          {step === 2 && (
            <PasswordStep
              password={password}
              setPassword={setPassword}
              onPrev={() => setStep(1)}
              onNext={() => setStep(3)}
            />
          )}

          {step === 3 && (
            <EmailStep
              email={email}
              setEmail={setEmail}
              onPrev={() => setStep(2)}
              onNext={handleSignup}
            />
          )}
        </div>
      </div>
    </div>
  )
}
