import CustomButton from "@shared/ui/CustomButton";
import CustomInput from "@shared/ui/CustomInput";
import { useNavigate } from "react-router-dom";
import { checkUsername } from "../api/authApi";
import { useState } from "react";

type UsernameProps = {
  name: string;
  setName: React.Dispatch<React.SetStateAction<string>>;
  username: string;
  setUsername: React.Dispatch<React.SetStateAction<string>>;
  onNext: () => void;
};

export default function UsernameStep({
  name,
  setName,
  username,
  setUsername,
  onNext,
}: UsernameProps) {
  const navigte = useNavigate();
  const [usernameMessage, setUsernameMessage] = useState("");
  const [isUsernameAvailable, setIsUsernameAvailable] = useState(false);
  const [hasAttemptedNext, setHasAttemptedNext] = useState(false);

  // 아이디 입력값을 변경하고 기존 중복 확인 결과를 초기화한다.
  const handleUsernameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setUsername(event.target.value);
    setIsUsernameAvailable(false);
    setUsernameMessage("");
  };

  // 아이디 중복 여부를 확인한다.
  const handleCheckUsername = async () => {
    if (!username.trim()) {
      setUsernameMessage("아이디를 입력해주세요.");
      return;
    }

    try {
      const isAvailable = await checkUsername(username);
      setIsUsernameAvailable(isAvailable);
      setUsernameMessage(isAvailable ? "사용 가능한 아이디입니다." : "이미 사용 중인 아이디입니다.");
    } catch (checkError) {
      setIsUsernameAvailable(false);
      setUsernameMessage(checkError instanceof Error ? checkError.message : "중복 확인에 실패했습니다.");
    }
  };

  // 필수 입력값과 중복 확인 결과를 확인하고 다음 단계로 이동한다.
  const handleNext = () => {
    setHasAttemptedNext(true);

    if (!username.trim()) {
      setUsernameMessage("아이디를 입력해주세요.");
      return;
    }

    if (!isUsernameAvailable) {
      setUsernameMessage("아이디 중복 확인을 해주세요.");
      return;
    }

    if (name.trim()) onNext();
  };

  return (
    <div>
      <div className="flex-1 mb-5 mt-12">
        <CustomInput
          label="이름"
          value={name}
          onChange={(e) => setName(e.target.value)}
          error={hasAttemptedNext && !name.trim() ? "이름을 입력해주세요." : ""}
        />
      </div>

      <div className="flex items-start gap-3">
          <CustomInput
            label="아이디"
            value={username}
            onChange={handleUsernameChange}
            error={!isUsernameAvailable ? usernameMessage : ""}
            success={isUsernameAvailable ? usernameMessage : ""}
          />
        <div className="w-[112px]">
          <CustomButton
            label="중복 확인"
            bgColor="#0AE365"
            color="white"
            fontSize="text-base"
            rounded="rounded-xl"
            onClick={handleCheckUsername}
          />
        </div>
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
          onClick={() => navigte('/login')}
        >
          이미 계정이 있어요
        </button>
      </div>
    </div>
  );
}
