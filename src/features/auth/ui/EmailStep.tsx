import CustomButton from "@shared/ui/CustomButton";
import CustomInput from "@shared/ui/CustomInput";
import { useState } from "react";
import { checkEmailVerification, sendEmailVerification } from "../api/authApi";

type EmailProps = {
  email: string;
  setEmail: React.Dispatch<React.SetStateAction<string>>;
  onNext: () => void;
  onPrev: () => void;
};

export default function EmailStep({ email, setEmail, onNext, onPrev }: EmailProps) {
  const [verificationCode, setVerificationCode] = useState("");
  const [isSent, setIsSent] = useState(false);
  const [message, setMessage] = useState("");
  const [isVerified, setIsVerified] = useState(false);

  // 입력한 이메일로 인증 코드를 전송한다.
  const handleSendEmail = async () => {
    try {
      setMessage("");
      await sendEmailVerification(email);
      setIsSent(true);
    } catch (sendError) {
      setMessage(sendError instanceof Error ? sendError.message : "인증 코드 전송에 실패했습니다.");
    }
  };

  // 이메일 인증 코드를 확인한다.
  const handleCheckEmail = async () => {
    try {
      setMessage("");
      await checkEmailVerification(email, verificationCode);
      setIsVerified(true);
      onNext();
    } catch (checkError) {
      setIsVerified(false);
      setMessage(checkError instanceof Error ? checkError.message : "인증 코드가 일치하지 않습니다.");
    }
  };

  return (
    <div>
      <div>
        <div className="flex items-start gap-3">
          <div className="flex-1 mb-5 mt-12">
            <CustomInput
              label="이메일"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="off"
              // error="이메일을 입력해주세요"
              success={isSent ? "인증 코드가 전송되었습니다" : ""}
            />
          </div>
          <div className="mt-[40px] w-[112px]">
            <CustomButton
              label="인증코드 전송"
              bgColor="#0AE365"
              color="white"
              onClick={handleSendEmail}
              fontSize="text-base"
              rounded="rounded-xl"
            />
          </div>
        </div>

        <CustomInput
          label="인증코드"
          value={verificationCode}
          onChange={(e) => setVerificationCode(e.target.value)}
          error={!isVerified ? message : ""}
        />
      </div>

      <div className="flex flex-col gap-3 mt-17">
        <CustomButton
          label="인증하기"
          bgColor="#0AE365"
          color="#F6F6F6"
          onClick={handleCheckEmail}
        />
      </div>

      <div className="flex gap-4 mt-3">
        <button
          className="text-sm text-[#5C5E5E] font-medium cursor-pointer"
          onClick={onPrev}
        >
          이전으로
        </button>
      </div>
    </div>
  );
}
