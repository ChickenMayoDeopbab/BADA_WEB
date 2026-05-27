import CustomButton from "@shared/ui/CustomButton";
import { FaGoogle, FaApple } from "react-icons/fa6";
import { SiNaver } from "react-icons/si";

export default function Signup() {
  return (
    <div className="bg-[#F5F5F5] w-screen h-screen p-10">
      <div className="w-full">
        <img src="src/shared/assets/badaLogo2.svg" style={{width: 100}}/>
      </div>
      <div className="w-full h-full flex justify-center items-center">
        <div className="bg-white w-[35%] h-[80%] rounded-xl shadow-[0px_0px_15px_rgba(0,0,0,0.1)] flex flex-col items-center p-10">
          <img src="src/shared/assets/shakingHand.svg" className="mt-10"/>
          <h6 className="font-bold text-2xl mt-5">바다에서 콜포비아를 극복해보세요!</h6>
          <span className="font-medium text-base text-[#5C5E5E] mt-1">로그인 후 시나리오 훈련, 워밍업 등을 이용할 수 있어요.</span>
          <div className="w-full flex flex-col gap-2 mt-auto">
            <CustomButton label="구글로 계속할래요" icon={<FaGoogle size={20}/>} bgColor="#F2F4F6"/>
            <CustomButton label="네이버로 계속할래요" icon={<SiNaver />} bgColor="#03CF5D" color="white"/>
            <CustomButton label="Apple로 계속할래요" icon={<FaApple size={23}/>} bgColor="black" color="white"/>
            <CustomButton label="아이디로 계속할래요" bgColor="#F8F8F8" />
          </div>
        </div>
      </div>
    </div>
  )
}