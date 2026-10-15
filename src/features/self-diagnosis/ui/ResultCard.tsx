import { useTranslation } from '@shared/lib'
import type { DiagnosisResult } from '@entities/diagnosis'
import { DiagnosisButton } from './DiagnosisButton'
import { DiagnosisCard } from './DiagnosisCard'
import { IoHelpCircle } from 'react-icons/io5'

type ResultCardProps = {
  result: DiagnosisResult
  onExit: () => void
}

// 진단으로 계산된 콜포비아 레벨과 요약을 보여줍니다.
export const ResultCard = ({ result, onExit }: ResultCardProps) => {
  const { t } = useTranslation()
  return (
    <DiagnosisCard>
      <div className="gap-8 pt-10 pb-14 flex w-full flex-col items-center text-center">
        <div className="gap-2 flex flex-col items-center">
          <p className="text-headline2 font-medium text-label-alternative">{t('내 레벨은?')}</p>
          <div className="gap-1.5 flex items-center">
            <h1 className="text-display1 font-bold text-label-normal">{result.levelName}</h1>
            {/* 도움말은 마우스를 올리거나 키보드로 포커스하면 레벨 설명을 보여줍니다. */}
            <div className="group relative flex">
              <button
                type="button"
                aria-label={t('레벨 설명 보기')}
                aria-describedby="diagnosis-level-description"
                className="flex rounded-pill text-line-normal hover:text-label-alternative"
              >
                <IoHelpCircle size={24} aria-hidden />
              </button>
              <p
                id="diagnosis-level-description"
                role="tooltip"
                className="p-3 top-8 w-60 invisible absolute left-1/2 z-10 -translate-x-1/2 rounded-component border border-line-neutral bg-background-normal text-label font-regular text-label-normal shadow-elevated-card group-focus-within:visible group-hover:visible"
              >
                {result.levelDescription}
              </p>
            </div>
          </div>
        </div>
        <hr className="w-80 border-t-2 border-line-alternative" />
        <p className="max-w-[420px] text-body font-medium break-keep whitespace-pre-line text-label-alternative">
          {result.summary}
        </p>
      </div>
      <DiagnosisButton label={t('저장하고 홈으로 가기')} onClick={onExit} />
    </DiagnosisCard>
  )
}
