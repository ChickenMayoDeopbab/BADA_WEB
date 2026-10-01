import type { LoginMode } from '../model/types'
import CustomButton from '@shared/ui/CustomButton'
import { FaGoogle, FaApple } from 'react-icons/fa6'
import { SiNaver } from 'react-icons/si'

type SocialProps = {
  setMode: React.Dispatch<React.SetStateAction<LoginMode>>
}

export default function SocialLogin({ setMode }: SocialProps) {
  return (
    <div className="p-10 h-screen w-screen bg-[#F5F5F5]">
      <div className="w-full">
        <img src="src/shared/assets/badaLogo2.svg" style={{ width: 100 }} />
      </div>
      <div className="flex h-full w-full items-center justify-center">
        <div className="bg-white rounded-xl p-10 flex h-[80%] w-[35%] flex-col items-center shadow-[0px_0px_15px_rgba(0,0,0,0.1)]">
          <img src="src/shared/assets/shakingHand.svg" className="mt-10" />
          <h6 className="text-2xl mt-5 font-bold">바다에서 콜포비아를 극복해보세요!</h6>
          <span className="text-base mt-1 font-medium text-[#5C5E5E]">
            로그인 후 시나리오 훈련, 워밍업 등을 이용할 수 있어요.
          </span>
          <div className="gap-2 mt-auto flex w-full flex-col">
            <CustomButton
              label="구글로 계속할래요"
              icon={<FaGoogle size={20} />}
              bgColor="#F2F4F6"
            />
            <CustomButton
              label="네이버로 계속할래요"
              icon={<SiNaver />}
              bgColor="#03CF5D"
              color="white"
            />
            <CustomButton
              label="Apple로 계속할래요"
              icon={<FaApple size={23} />}
              bgColor="black"
              color="white"
            />
            <CustomButton
              label="아이디로 계속할래요"
              bgColor="#F8F8F8"
              onClick={() => setMode('id')}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
