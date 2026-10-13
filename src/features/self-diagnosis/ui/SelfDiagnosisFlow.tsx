import { useSelfDiagnosis } from '../model/useSelfDiagnosis'
import { DiagnosisButton } from './DiagnosisButton'
import { IntroCard } from './IntroCard'
import { QuestionCard } from './QuestionCard'
import { ResultCard } from './ResultCard'
import { SensitiveConsentDialog } from './SensitiveConsentDialog'
import { StatusCard } from './StatusCard'
import checkCircle from '@shared/assets/self-diagnosis/check-circle.svg'
import hourglass from '@shared/assets/self-diagnosis/hourglass.svg'

// 자가진단의 시작부터 결과까지 단계에 맞는 카드를 보여줍니다.
export const SelfDiagnosisFlow = () => {
  const diagnosis = useSelfDiagnosis()
  const { step, consentStatus, result } = diagnosis

  return (
    <main className="px-4 py-10 flex min-h-screen w-full items-center justify-center bg-background-alternative">
      {step === 'intro' && <IntroCard diagnosis={diagnosis} />}
      {step === 'question' && <QuestionCard diagnosis={diagnosis} />}
      {step === 'submitting' && (
        <StatusCard
          icon={hourglass}
          title="콜포비아 레벨을 계산 중이에요."
          description="잠시만 기다려 주세요."
        />
      )}
      {step === 'done' && (
        <StatusCard
          icon={checkCircle}
          iconClassName="size-24"
          title="콜포비아 레벨의 계산이 끝났어요."
          description="함께 결과를 확인해볼까요?"
        />
      )}
      {step === 'error' && (
        <StatusCard title="레벨 계산에 실패했어요." description={diagnosis.errorMessage}>
          <DiagnosisButton label="다시 시도하기" onClick={diagnosis.retrySubmit} />
        </StatusCard>
      )}
      {step === 'result' && result && (
        <ResultCard result={result} onExit={diagnosis.goToDashboard} />
      )}

      {(consentStatus === 'required' || consentStatus === 'saving') && (
        <SensitiveConsentDialog
          isSaving={consentStatus === 'saving'}
          onAccept={() => void diagnosis.acceptConsent()}
          onDecline={diagnosis.declineConsent}
        />
      )}
    </main>
  )
}
