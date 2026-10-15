import { DiagnosisButton } from './DiagnosisButton'
import { useDialogFocus } from '@shared/lib'

type SensitiveConsentDialogProps = {
  isSaving: boolean
  onAccept: () => void
  onDecline: () => void
}

// 자가진단 응답을 제출하기 전에 민감정보 처리 동의를 받는 다이얼로그입니다.
export const SensitiveConsentDialog = ({
  isSaving,
  onAccept,
  onDecline,
}: SensitiveConsentDialogProps) => {
  const dialogRef = useDialogFocus(true, onDecline, isSaving)

  return (
    <div className="px-4 inset-0 fixed z-50 flex items-center justify-center bg-neutral-5/40">
      <section
        ref={dialogRef}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-labelledby="sensitive-consent-title"
        aria-describedby="sensitive-consent-description"
        className="ux-overlay gap-6 p-6 flex w-full max-w-[420px] flex-col rounded-dialog bg-background-normal shadow-elevated-card"
      >
        <div className="gap-2 flex flex-col">
          <h2 id="sensitive-consent-title" className="text-headline1 font-bold text-label-normal">
            민감정보 처리 동의가 필요해요
          </h2>
          <p
            id="sensitive-consent-description"
            className="text-label font-medium break-keep text-label-alternative"
          >
            통화불안 진단 답변과 점수, 음성 분석 결과, 훈련 분석 및 피드백을 제공하기 위해
            민감정보를 처리합니다. 동의하지 않아도 일반 서비스는 이용할 수 있어요.
          </p>
        </div>
        <div className="gap-3 flex">
          <DiagnosisButton
            label="나중에"
            variant="secondary"
            disabled={isSaving}
            onClick={onDecline}
          />
          <DiagnosisButton
            label={isSaving ? '저장 중...' : '동의하기'}
            disabled={isSaving}
            onClick={onAccept}
            autoFocus
          />
        </div>
      </section>
    </div>
  )
}
