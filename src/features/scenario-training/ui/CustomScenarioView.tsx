import { ActionDropdown, ConfirmDialog, LoadingSpinner, BackIcon } from '@shared/ui'
import { useCustomScenario } from '../model/useCustomScenario'
import type { ScenarioCategory } from '@entities/scenario'
import customError from '@shared/assets/scenario-training/custom-error.svg'
import customLoading from '@shared/assets/scenario-training/custom-loading.svg'
import customSuccess from '@shared/assets/scenario-training/custom-success.svg'
import { IoChevronDown } from 'react-icons/io5'
import type { ReactNode } from 'react'

const categoryOptions: Array<{ value: ScenarioCategory; label: string }> = [
  { value: 'work', label: '업무' },
  { value: 'daily', label: '일상' },
  { value: 'school', label: '학교' },
  { value: 'other', label: '기타' },
]

interface CustomShellProps {
  onBack: () => void
  children: ReactNode
}

/** 커스텀 생성 화면의 공통 헤더와 카드 프레임입니다. */
const CustomShell = ({ onBack, children }: CustomShellProps) => {
  return (
    <main className="min-w-0 px-10 pt-6 max-sm:px-4 max-sm:pt-5 gap-4 max-sm:h-auto max-sm:min-h-[calc(100dvh-128px)] flex h-[calc(100dvh-32px)] flex-1 flex-col">
      <header className="h-11 gap-3.5 flex shrink-0 items-center">
        <button
          type="button"
          onClick={onBack}
          className="size-11 flex items-center justify-center rounded-component bg-background-normal text-label-normal"
          aria-label={'이전'}
        >
          <BackIcon />
        </button>
        <h1 className="text-title1 font-bold text-label-neutral">{'커스텀 시나리오 생성'}</h1>
      </header>
      <section className="min-h-0 px-12 max-sm:px-5 flex flex-1 justify-center rounded-dialog bg-background-normal">
        {children}
      </section>
    </main>
  )
}

interface ProgressProps {
  currentStep: 1 | 2
}

/** 입력 단계의 진행 상태를 표시합니다. */
const Progress = ({ currentStep }: ProgressProps) => (
  <div className="gap-2 flex" aria-label={`2단계 중 ${currentStep}단계`}>
    <span className="h-1 flex-1 rounded-pill bg-primary-normal" />
    <span
      className={`h-1 flex-1 rounded-pill ${
        currentStep === 2 ? 'bg-primary-normal' : 'bg-fill-alternative'
      }`}
    />
  </div>
)

/** Figma 커스텀 시나리오 생성 흐름을 표시합니다. */
export const CustomScenarioView = () => {
  const customScenario = useCustomScenario()

  if (customScenario.step === 'loading') {
    return (
      <CustomShell onBack={customScenario.handleGoToCatalog}>
        <div
          role="status"
          className="flex h-full min-h-[500px] flex-col items-center justify-center text-center"
        >
          <LoadingSpinner className="mb-4 size-7 text-primary-normal" />
          <img src={customLoading} alt="" className="size-24" />
          <h2 className="mt-5 text-title2 font-bold text-label-normal">
            {'나만을 위한 커스텀 시나리오가 만들어지고 있어요!'}
          </h2>
          <p className="mt-5 text-body font-medium text-label-alternative">
            {'잠시만 기다려 주세요.'}
          </p>
        </div>
      </CustomShell>
    )
  }

  if (customScenario.step === 'success') {
    return (
      <CustomShell onBack={customScenario.handleGoToCatalog}>
        <div
          role="status"
          className="flex h-full min-h-[500px] flex-col items-center justify-center text-center"
        >
          <div className="size-24 flex items-center justify-center rounded-pill border-[6px] border-primary-normal">
            <img src={customSuccess} alt="" className="size-[53px]" />
          </div>
          <h2 className="mt-5 text-title2 font-bold text-label-normal">
            {'커스텀 시나리오가 완성됐어요.'}
          </h2>
          <p className="mt-5 text-body font-medium text-label-alternative">
            {'내가 만든 시나리오로 훈련을 시작해볼까요?'}
          </p>
          <div className="mt-5 space-y-3 w-[360px] max-w-full">
            <button
              type="button"
              onClick={customScenario.handleStartTraining}
              className="h-14 w-full rounded-component bg-primary-normal text-headline2 font-bold text-common-0"
            >
              {'훈련 바로 시작하기'}
            </button>
            <button
              type="button"
              onClick={customScenario.handleGoToCatalog}
              className="h-14 w-full rounded-component bg-background-alternative text-headline2 font-bold text-label-neutral"
            >
              {'시나리오 보러가기'}
            </button>
          </div>
        </div>
      </CustomShell>
    )
  }

  if (customScenario.step === 'error') {
    return (
      <CustomShell onBack={customScenario.handleGoToCatalog}>
        <div
          role="status"
          className="flex h-full min-h-[500px] flex-col items-center justify-center text-center"
        >
          <img src={customError} alt="" className="size-24" />
          <h2 className="mt-5 text-title2 font-bold text-label-normal">
            {'시나리오 생성에 실패했어요.'}
          </h2>
          <p className="mt-5 text-body font-medium text-label-alternative">
            {customScenario.errorMessage || '생성 시 입력한 내용을 다시 확인해주세요.'}
          </p>
          <div className="mt-5 space-y-3 w-[360px] max-w-full">
            <button
              type="button"
              onClick={customScenario.handleRetry}
              className="h-14 w-full rounded-component bg-primary-normal text-headline2 font-bold text-common-0"
            >
              {'다시 시도하기'}
            </button>
            <button
              type="button"
              onClick={customScenario.handleGoToCatalog}
              className="h-14 w-full rounded-component bg-background-alternative text-headline2 font-bold text-label-neutral"
            >
              {'홈으로 돌아가기'}
            </button>
          </div>
        </div>
      </CustomShell>
    )
  }

  const selectedCategory = categoryOptions.find(
    (category) => category.value === customScenario.form.category,
  )

  return (
    <CustomShell onBack={customScenario.handleBack}>
      <div className="py-12 flex h-full w-full max-w-[640px] flex-col">
        <Progress currentStep={customScenario.step === 'info' ? 1 : 2} />

        {customScenario.step === 'info' ? (
          <div className="mt-10 space-y-10">
            <div className="relative">
              <label className="mb-2.5 block text-body font-bold text-label-neutral">
                {'카테고리'}
              </label>
              <ActionDropdown
                label={'카테고리'}
                placementClassName="inset-x-0 top-14"
                className="w-full"
                triggerClassName="h-14 px-5 flex w-full items-center justify-between rounded-component bg-fill-normal text-left text-body text-label-normal"
                icon={
                  <>
                    <span
                      className={selectedCategory ? 'text-label-normal' : 'text-label-alternative'}
                    >
                      {selectedCategory?.label ?? '카테고리를 선택해주세요.'}
                    </span>
                    <IoChevronDown size={16} aria-hidden="true" />
                  </>
                }
                items={categoryOptions.map((category) => ({
                  label: category.label,
                  onSelect: () => customScenario.handleFieldChange('category', category.value),
                }))}
              />
            </div>
            <label className="block">
              <span className="mb-2.5 block text-body font-bold text-label-neutral">
                {'시나리오 제목'}
              </span>
              <input
                value={customScenario.form.title}
                onChange={(event) => customScenario.handleFieldChange('title', event.target.value)}
                maxLength={50}
                placeholder={'시나리오를 나타낼 제목을 입력해주세요.'}
                className="h-14 px-5 w-full rounded-component bg-fill-normal text-body text-label-normal outline-none placeholder:text-line-normal focus:outline-2 focus:outline-primary-normal"
              />
            </label>
          </div>
        ) : (
          <div className="mt-10 space-y-10">
            <label className="block">
              <span className="mb-2.5 block text-body font-bold text-label-neutral">
                {'전화 상대'}
              </span>
              <input
                value={customScenario.form.callTarget}
                onChange={(event) =>
                  customScenario.handleFieldChange('callTarget', event.target.value)
                }
                maxLength={100}
                placeholder={'전화 상대에 대해 설명해주세요.'}
                className="h-14 px-5 w-full rounded-component bg-fill-normal text-body text-label-normal outline-none placeholder:text-line-normal focus:outline-2 focus:outline-primary-normal"
              />
            </label>
            <label className="block">
              <span className="mb-2.5 block text-body font-bold text-label-neutral">
                {'전화 목적'}
              </span>
              <textarea
                value={customScenario.form.callPurpose}
                onChange={(event) =>
                  customScenario.handleFieldChange('callPurpose', event.target.value)
                }
                maxLength={200}
                placeholder={'전화의 목적을 설명해주세요.'}
                className="px-5 py-4 h-[180px] w-full resize-none rounded-component bg-fill-normal text-body text-label-normal outline-none placeholder:text-line-normal focus:outline-2 focus:outline-primary-normal"
              />
            </label>
          </div>
        )}

        <button
          type="button"
          disabled={
            customScenario.step === 'info'
              ? !customScenario.isInfoValid
              : !customScenario.isDetailValid
          }
          onClick={
            customScenario.step === 'info' ? customScenario.handleNext : customScenario.handleSubmit
          }
          className="h-14 mt-auto w-full rounded-component bg-primary-normal text-headline2 font-bold text-common-0 disabled:cursor-not-allowed disabled:bg-fill-alternative disabled:text-label-alternative"
        >
          {customScenario.step === 'info' ? '다음으로' : '시나리오 생성하기'}
        </button>
      </div>

      {customScenario.isExitDialogOpen && (
        <ConfirmDialog
          title={'정말 나갈까요?'}
          description={'작성하시던 커스텀 시나리오는 저장되지 않아요.'}
          confirmLabel={'나가기'}
          onClose={customScenario.handleCloseExitDialog}
          onConfirm={customScenario.handleGoToCatalog}
        />
      )}
    </CustomShell>
  )
}
