import type {
  DashboardInterval,
  DashboardPersonality,
  DashboardSessionType,
} from '@entities/dashboard'
import { useDialogFocus } from '@shared/lib'
import { OverlayPortal } from '@shared/ui'
import type { DashboardFilterDialogModel } from '../model/useDashboardFilterDialog'
import { DashboardFilterChoices } from './DashboardFilterChoices'

/** 훈련 검색 항목을 별도 모달에서 선택합니다. */
export const DashboardFilterDialog = ({
  model,
  isScenarioView,
  error,
}: {
  model: DashboardFilterDialogModel
  isScenarioView: boolean
  error: string | null
}) => {
  const dialogRef = useDialogFocus<HTMLElement>(model.isOpen, model.handleCancel)
  const { draft, setDraft } = model
  if (!model.isOpen) return null
  return (
    <OverlayPortal>
      <button
        type="button"
        tabIndex={-1}
        aria-label="훈련 골라보기 배경 닫기"
        onClick={model.handleCancel}
        className="inset-0 fixed z-80 cursor-default bg-common-100/20 backdrop-blur-[2px]"
      />
      <section
        ref={dialogRef}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-labelledby="dashboard-filter-title"
        className="dashboard-details-surface fixed top-1/2 left-1/2 z-90 flex max-h-[calc(100dvh-32px)] w-[480px] max-w-[calc(100%-32px)] -translate-x-1/2 -translate-y-1/2 flex-col overflow-hidden rounded-dialog bg-background-normal shadow-elevated-card"
      >
        <header className="gap-3 px-7 py-6 flex shrink-0 items-center justify-between border-b border-line-alternative">
          <h2 id="dashboard-filter-title" className="text-headline1 font-bold text-label-normal">
            훈련 골라보기
          </h2>
          <button
            type="button"
            aria-label="훈련 골라보기 닫기"
            onClick={model.handleCancel}
            className="size-8 rounded-control text-title2 text-label-alternative hover:bg-fill-normal"
          >
            ×
          </button>
        </header>
        <form onSubmit={model.handleSubmit} className="min-h-0 flex flex-col">
          <div className="min-h-0 space-y-7 px-7 py-6 overflow-y-auto text-label text-label-neutral">
            <p className="text-caption text-label-alternative">
              보고 싶은 훈련을 골라 주세요. 선택하지 않은 항목은 전체 훈련을 보여줘요.
            </p>
            <DashboardFilterChoices<DashboardSessionType | undefined>
              label="시나리오 종류"
              value={draft.sessionType}
              onChange={(sessionType) => setDraft({ ...draft, sessionType })}
              options={[
                { value: undefined, label: '전체' },
                { value: 'SCENARIO', label: '기본 상황' },
                { value: 'CUSTOM', label: '직접 만든 상황' },
              ]}
            />
            <DashboardFilterChoices<number | undefined>
              label="힌트 단계"
              value={draft.scriptLevel}
              onChange={(scriptLevel) => setDraft({ ...draft, scriptLevel })}
              options={[
                { value: undefined, label: '전체' },
                { value: 1, label: '1단계' },
                { value: 2, label: '2단계' },
                { value: 3, label: '3단계' },
              ]}
            />
            <DashboardFilterChoices<string | undefined>
              label="난이도"
              value={draft.difficulty}
              onChange={(difficulty) => setDraft({ ...draft, difficulty })}
              options={[
                { value: undefined, label: '전체' },
                { value: 'low', label: '쉬움' },
                { value: 'medium', label: '보통' },
                { value: 'high', label: '어려움' },
              ]}
            />
            <DashboardFilterChoices<DashboardPersonality | undefined>
              label="상대 말투"
              value={draft.aiPersonality}
              onChange={(aiPersonality) => setDraft({ ...draft, aiPersonality })}
              options={[
                { value: undefined, label: '전체' },
                { value: 'KIND', label: '친절함' },
                { value: 'NORMAL', label: '보통' },
                { value: 'TOUGH', label: '까다로움' },
                { value: 'RUDE', label: '무례함' },
              ]}
            />
            {isScenarioView && (
              <DashboardFilterChoices<DashboardInterval>
                label="추이 단위"
                value={draft.interval ?? 'DAY'}
                onChange={(interval) => setDraft({ ...draft, interval })}
                options={[
                  { value: 'DAY', label: '일별' },
                  { value: 'WEEK', label: '주별' },
                ]}
              />
            )}

            {error && (
              <p role="alert" className="text-label text-status-error">
                {error}
              </p>
            )}
          </div>
          <footer className="gap-3 px-7 py-5 flex shrink-0 items-center border-t border-line-alternative">
            <button
              type="button"
              onClick={model.handleReset}
              className="mr-auto text-label text-label-alternative hover:text-label-normal"
            >
              초기화
            </button>
            <button
              type="button"
              onClick={model.handleCancel}
              className="h-11 px-4 rounded-control border border-line-normal text-label font-medium text-label-normal hover:bg-fill-normal"
            >
              취소
            </button>
            <button
              type="submit"
              className="h-11 px-4 rounded-control bg-primary-normal text-label font-bold text-label-button-text hover:opacity-90"
            >
              적용
            </button>
          </footer>
        </form>
      </section>
    </OverlayPortal>
  )
}
