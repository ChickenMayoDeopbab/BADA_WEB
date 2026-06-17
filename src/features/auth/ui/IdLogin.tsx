import { useState } from "react";
import { useNavigate } from "react-router-dom";
import CustomInput from "@shared/ui/CustomInput";
import { IoMdEye, IoMdEyeOff } from "react-icons/io";
import CustomButton from "@shared/ui/CustomButton";
import { FaRegCheckCircle, FaCheckCircle } from "react-icons/fa";

interface LoginForm {
  username: string;
  password: string;
}

export default function LoginScreen() {
  const [form, setForm] = useState<LoginForm>({ username: "", password: "" });
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isChecked, setIsChecked] = useState(false);
  const navigate = useNavigate();

  const handleChange = (field: keyof LoginForm) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const handleLogin = async () => {
    navigate("/");
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
              아이디로 로그인
            </h1>
          </div>
          <div className="mb-5">
            <CustomInput
              label="아이디"
              name="username"
              value={form.username}
              onChange={handleChange("username")}
              autoComplete="off"
              error="아이디를 입력해주세요"
            />
          </div>
          <div className="mb-3">
            <CustomInput
              label="비밀번호"
              name="password"
              value={form.password}
              onChange={handleChange("password")}
              autoComplete="off"
              error="비밀번호를 입력해주세요"
              type={isPasswordVisible ? "text" : "password"}
              rightIcon={
                <button
                  type="button"
                  onClick={() => setIsPasswordVisible((v) => !v)}
                  className="text-[#BDBEBE]"
                  aria-label="비밀번호 표시/숨김"
                >
                  {isPasswordVisible ? (
                    <IoMdEyeOff size={24} className="cursor-pointer"/>
                  ) : (
                    <IoMdEye size={24} className="cursor-pointer"/>
                  )}
                </button>
              }
            />
          </div>
          <button
            type="button"
            onClick={() => setIsChecked((c) => !c)}
            className="flex items-center gap-2 mb-5 text-sm"
          >
            {isChecked ? <FaCheckCircle size={23} color="#0AE365" /> : <FaRegCheckCircle size={23} color="#BDBEBE" />}
            <span className={`${isChecked ? "text-[#0D0D0E]" : "text-[#BDBEBE]"} font-medium text-base cursor-pointer`}>
              로그인 상태 유지
            </span>
          </button>
          <div className="flex flex-col gap-3 mb-4">
            <CustomButton
              label="로그인"
              bgColor="#0AE365"
              color="white"
              onClick={handleLogin}
            />
            <CustomButton
              label="회원가입"
              bgColor="#F8F8F8"
              color="#0D0D0E"
              onClick={() => navigate("/signup")}
            />
          </div>
          <div className="flex gap-4">
            <button className="text-sm text-[#5C5E5E] font-medium cursor-pointer">아이디 찾기</button>
            <button className="text-sm text-[#5C5E5E] font-medium cursor-pointer">비밀번호 찾기</button>
          </div>
        </div>
      </div>
    </div>
  );
}