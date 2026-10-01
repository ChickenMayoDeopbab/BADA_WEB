import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import CustomInput from '@shared/ui/CustomInput'
import { IoMdEye, IoMdEyeOff } from 'react-icons/io'
import CustomButton from '@shared/ui/CustomButton'
import { FaRegCheckCircle, FaCheckCircle } from 'react-icons/fa'
import { routePaths } from '@shared/config'

interface LoginForm {
  username: string
  password: string
}

export default function LoginScreen() {
  const [form, setForm] = useState<LoginForm>({ username: '', password: '' })
  const [isPasswordVisible, setIsPasswordVisible] = useState(false)
  const [isChecked, setIsChecked] = useState(false)
  const navigate = useNavigate()

  const handleChange = (field: keyof LoginForm) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }))
  }

  const handleLogin = async () => {
    navigate(routePaths.dashboard)
  }

  return (
    <div className="p-10 h-screen w-screen bg-[#F5F5F5]">
      <div className="w-full">
        <img src="src/shared/assets/badaLogo2.svg" style={{ width: 100 }} />
      </div>
      <div className="flex h-full w-full items-center justify-center">
        <div className="bg-white rounded-xl p-10 flex h-[80%] w-[35%] flex-col shadow-[0px_0px_15px_rgba(0,0,0,0.1)]">
          <div className="mb-10 flex flex-1 items-center">
            <h1 className="text-3xl font-bold text-[#0D0D0E]">아이디로 로그인</h1>
          </div>
          <div className="mb-5">
            <CustomInput
              label="아이디"
              name="username"
              value={form.username}
              onChange={handleChange('username')}
              autoComplete="off"
              error="아이디를 입력해주세요"
            />
          </div>
          <div className="mb-3">
            <CustomInput
              label="비밀번호"
              name="password"
              value={form.password}
              onChange={handleChange('password')}
              autoComplete="off"
              error="비밀번호를 입력해주세요"
              type={isPasswordVisible ? 'text' : 'password'}
              rightIcon={
                <button
                  type="button"
                  onClick={() => setIsPasswordVisible((v) => !v)}
                  className="text-[#BDBEBE]"
                  aria-label="비밀번호 표시/숨김"
                >
                  {isPasswordVisible ? (
                    <IoMdEyeOff size={24} className="cursor-pointer" />
                  ) : (
                    <IoMdEye size={24} className="cursor-pointer" />
                  )}
                </button>
              }
            />
          </div>
          <button
            type="button"
            onClick={() => setIsChecked((c) => !c)}
            className="gap-2 mb-5 text-sm flex items-center"
          >
            {isChecked ? (
              <FaCheckCircle size={23} color="#0AE365" />
            ) : (
              <FaRegCheckCircle size={23} color="#BDBEBE" />
            )}
            <span
              className={`${isChecked ? 'text-[#0D0D0E]' : 'text-[#BDBEBE]'} text-base cursor-pointer font-medium`}
            >
              로그인 상태 유지
            </span>
          </button>
          <div className="gap-3 mb-4 flex flex-col">
            <CustomButton label="로그인" bgColor="#0AE365" color="white" onClick={handleLogin} />
            <CustomButton
              label="회원가입"
              bgColor="#F8F8F8"
              color="#0D0D0E"
              onClick={() => navigate(routePaths.signup)}
            />
          </div>
          <div className="gap-4 flex">
            <button
              type="button"
              onClick={() => navigate(routePaths.findId)}
              className="text-sm cursor-pointer font-medium text-[#5C5E5E]"
            >
              아이디 찾기
            </button>
            <button
              type="button"
              onClick={() => navigate(routePaths.resetPassword)}
              className="text-sm cursor-pointer font-medium text-[#5C5E5E]"
            >
              비밀번호 찾기
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
