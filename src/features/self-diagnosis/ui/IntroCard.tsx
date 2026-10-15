import type { SelfDiagnosis } from '../model/useSelfDiagnosis'
import { DiagnosisButton } from './DiagnosisButton'
import { DiagnosisCard } from './DiagnosisCard'
import partyFace from '@shared/assets/self-diagnosis/party-face.svg'

type IntroCardProps = {
  diagnosis: SelfDiagnosis
}

// 자가진단 시작 전 환영 문구와 시작 버튼을 보여줍니다.
export const IntroCard = ({ diagnosis }: IntroCardProps) => {
  const { totalCount, consentStatus, errorMessage, start } = diagnosis

  return (
    <DiagnosisCard>
      <div className="gap-6 pt-6 pb-12 flex w-full flex-col items-center text-center">
        <img src={partyFace} alt="" className="size-[120px]" />
        <div className="gap-3 flex flex-col items-center">
          <h1 className="text-title1 font-bold text-label-normal">
            {'바다에 오신 것을 환영해요!'}
          </h1>
          <p className="text-body font-medium whitespace-pre-line text-label-alternative">
            {'간단한 자가진단을 통해\n나의 콜포비아 지수를 진단해보세요.'}
          </p>
        </div>
        {totalCount > 0 && (
          <span className="px-3 py-1.5 rounded-pill bg-fill-neutral text-label font-medium text-label-alternative">
            {'총'}
            {totalCount}
            {'문항'}
          </span>
        )}
      </div>
      {errorMessage && (
        <p role="alert" className="mb-3 text-label font-medium text-status-error">
          {errorMessage}
        </p>
      )}
      <DiagnosisButton
        label={consentStatus === 'checking' ? '확인 중...' : '자가진단 시작하기'}
        disabled={consentStatus !== 'idle'}
        onClick={() => void start()}
      />
    </DiagnosisCard>
  )
}
