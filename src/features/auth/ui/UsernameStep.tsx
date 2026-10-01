import CustomButton from '@shared/ui/CustomButton'
import CustomInput from '@shared/ui/CustomInput'
import { useNavigate } from 'react-router-dom'

type UsernameProps = {
  username: string
  setUsername: React.Dispatch<React.SetStateAction<string>>
  onNext: () => void
}

export default function UsernameStep({ username, setUsername, onNext }: UsernameProps) {
  const navigte = useNavigate()

  return (
    <div>
      <div className="mb-5 mt-12 flex-1">
        <CustomInput label="이름" error="이름을 입력해주세요" />
      </div>

      <div className="gap-3 flex items-start">
        <CustomInput
          label="아이디"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          error="아이디를 입력해주세요"
        />
        <div className="w-[112px]">
          <CustomButton
            label="중복 확인"
            bgColor="#0AE365"
            color="white"
            fontSize="text-base"
            rounded="rounded-xl"
          />
        </div>
      </div>

      <div className="gap-3 mt-17 flex flex-col">
        <CustomButton label="다음으로" bgColor="#0AE365" color="#F6F6F6" onClick={onNext} />
      </div>

      <div className="gap-4 mt-3 flex">
        <button
          className="text-sm cursor-pointer font-medium text-[#5C5E5E]"
          onClick={() => navigte('/login')}
        >
          이미 계정이 있어요
        </button>
      </div>
    </div>
  )
}
