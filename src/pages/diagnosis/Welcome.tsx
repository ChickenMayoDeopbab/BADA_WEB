import CustomButton from "@shared/ui/CustomButton";

export default function Welcome() {
  return (
    <div className="bg-[#F5F5F5] w-screen h-screen p-10">
      <div className="w-full">
        <img src="src/shared/assets/badaLogo2.svg" style={{ width: 100 }} />
      </div>
      <div className="w-full h-full flex justify-center items-center">
        <div className="bg-white w-[35%] h-[80%] rounded-xl shadow-[0px_0px_15px_rgba(0,0,0,0.1)] flex flex-col items-center p-10">
          <div className="flex flex-col justify-center items-center mt-18 mb-auto">
            <img src="src/shared/assets/partyFace.svg"  style={{ width: 100 }}/>
            <h2 className="font-bold text-3xl mt-6">바다에 오신 것을 환영해요!</h2>
            <span className="text-base font-medium text-[#5C5E5E] mt-1">간단한 자가진단을 통해 나의 콜포비아 지수를 진단해보세요.</span>
          </div>
          <CustomButton label="자가진단 시작하기" bgColor="#0AE365" color="white"/>
        </div>
      </div>
    </div>
  )
}