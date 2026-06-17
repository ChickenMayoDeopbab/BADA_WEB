import EmailStep from "@features/auth/ui/EmailStep";
import PasswordStep from "@features/auth/ui/PasswordStep";
import UsernameStep from "@features/auth/ui/UsernameStep";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function SignupScreen() {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const navigate = useNavigate();

  const handleSignup = async () => {
    navigate("/welcome");
  };

  return (
    <div className="bg-[#F5F5F5] w-screen h-screen p-10">
      <div className="w-full">
        <img src="src/shared/assets/badaLogo2.svg" style={{ width: 100 }} />
      </div>
      <div className="w-full h-full flex justify-center items-center">
        <div className="bg-white w-[35%] h-[80%] rounded-xl shadow-[0px_0px_15px_rgba(0,0,0,0.1)] flex flex-col p-10">
          <div className="flex-1 flex items-center mb-10">
            <h1 className="text-3xl font-bold text-[#0D0D0E]">
              회원가입
            </h1>
          </div>

          {step === 1 && (
            <UsernameStep
              username={username}
              setUsername={setUsername}
              onNext={() => setStep(2)}
            />
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
  );
}