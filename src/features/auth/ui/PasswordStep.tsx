import CustomButton from "@shared/ui/CustomButton";
import CustomInput from "@shared/ui/CustomInput";
import { useState } from "react";
import { IoMdEye, IoMdEyeOff } from "react-icons/io";

type PasswordProps = {
  password: string;
  setPassword: React.Dispatch<React.SetStateAction<string>>;
  onPrev: () => void;
  onNext: () => void;
};

export default function PasswordStep({
  password,
  setPassword,
  onPrev,
  onNext,
}: PasswordProps) {
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isConfirmPasswordVisible, setIsConfirmPasswordVisible] = useState(false);
  const [hasAttemptedNext, setHasAttemptedNext] = useState(false);

  // 비밀번호 입력값이 유효하고 서로 일치하면 다음 단계로 이동한다.
  const handleNext = () => {
    setHasAttemptedNext(true);

    if (password && password === confirmPassword) onNext();
  };

  return (
    <div>
      <div className="flex-1 mb-5 mt-12">
        <CustomInput
          label="비밀번호"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          type={isPasswordVisible ? "text" : "password"}
          error={hasAttemptedNext && !password ? "비밀번호를 입력해주세요" : ""}
          rightIcon={
            <button
              type="button"
              onClick={() => setIsPasswordVisible((v) => !v)}
              className="text-[#BDBEBE]"
            >
              {isPasswordVisible ? <IoMdEyeOff size={20} /> : <IoMdEye size={20} />}
            </button>
          }
        />
      </div>

      <div className="mb-4">
        <CustomInput
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          type={isConfirmPasswordVisible ? "text" : "password"}
          placeholder="비밀번호를 다시 입력하세요."
          error={hasAttemptedNext && password !== confirmPassword ? "비밀번호가 일치하지 않습니다" : ""}
          rightIcon={
            <button
              type="button"
              onClick={() => setIsConfirmPasswordVisible((v) => !v)}
              className="text-[#BDBEBE]"
            >
              {isConfirmPasswordVisible ? <IoMdEyeOff size={20} /> : <IoMdEye size={20} />}
            </button>
          }
        />
      </div>

      <div className="flex flex-col gap-3 mt-17">
        <CustomButton
          label="다음으로"
          bgColor="#0AE365"
          color="#F6F6F6"
          onClick={handleNext}
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
