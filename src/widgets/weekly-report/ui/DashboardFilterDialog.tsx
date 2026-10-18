import type {
  DashboardInterval,
  DashboardPersonality,
  DashboardSessionType,
} from '@entities/dashboard'
import { useDialogFocus } from '@shared/lib'
import { OverlayPortal } from '@shared/ui'
import type { DashboardFilterDialogModel } from '../model/useDashboardFilterDialog'
import { detailFieldClass } from './DashboardDetailParts'

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
        className="dashboard-details-surface fixed top-1/2 left-1/2 z-90 flex max-h-[calc(100dvh-32px)] w-[440px] max-w-[calc(100%-32px)] -translate-x-1/2 -translate-y-1/2 flex-col overflow-hidden rounded-dialog bg-background-normal shadow-elevated-card"
      >
        <header className="gap-3 px-6 py-5 flex shrink-0 items-center justify-between border-b border-line-alternative">
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
          <div className="min-h-0 space-y-4 px-6 py-5 overflow-y-auto text-label text-label-neutral">
            <p className="text-caption text-label-alternative">
              보고 싶은 훈련을 골라 주세요. 선택하지 않은 항목은 전체 훈련을 보여줘요.
            </p>
            <div className="mt-3 gap-3 grid grid-cols-2">
              <label className="gap-2 flex flex-col">
                시나리오 종류
                <select
                  value={draft.sessionType ?? ''}
                  onChange={(event) =>
                    setDraft({
                      ...draft,
                      sessionType: (event.target.value || undefined) as
                        DashboardSessionType | undefined,
                    })
                  }
                  className={detailFieldClass}
                >
                  <option value="">전체</option>
                  <option value="SCENARIO">기본 상황</option>
                  <option value="CUSTOM">직접 만든 상황</option>
                </select>
              </label>
              <label className="gap-2 flex flex-col">
                힌트 단계
                <select
                  value={draft.scriptLevel ?? ''}
                  onChange={(event) =>
                    setDraft({
                      ...draft,
                      scriptLevel: event.target.value ? Number(event.target.value) : undefined,
                    })
                  }
                  className={detailFieldClass}
                >
                  <option value="">전체</option>
                  {[1, 2, 3].map((level) => (
                    <option key={level} value={level}>
                      {level}단계
                    </option>
                  ))}
                </select>
              </label>
              <label className="gap-2 flex flex-col">
                난이도
                <select
                  value={draft.difficulty ?? ''}
                  onChange={(event) =>
                    setDraft({ ...draft, difficulty: event.target.value || undefined })
                  }
                  className={detailFieldClass}
                >
                  <option value="">전체</option>
                  <option value="low">쉬움</option>
                  <option value="medium">보통</option>
                  <option value="high">어려움</option>
                </select>
              </label>
              <label className="gap-2 flex flex-col">
                상대 말투
                <select
                  value={draft.aiPersonality ?? ''}
                  onChange={(event) =>
                    setDraft({
                      ...draft,
                      aiPersonality: (event.target.value || undefined) as
                        DashboardPersonality | undefined,
                    })
                  }
                  className={detailFieldClass}
                >
                  <option value="">전체</option>
                  <option value="KIND">친절함</option>
                  <option value="NORMAL">보통</option>
                  <option value="TOUGH">까다로움</option>
                  <option value="RUDE">무례함</option>
                </select>
              </label>
              {isScenarioView && (
                <label className="gap-2 flex flex-col">
                  추이 단위
                  <select
                    value={draft.interval}
                    onChange={(event) =>
                      setDraft({ ...draft, interval: event.target.value as DashboardInterval })
                    }
                    className={detailFieldClass}
                  >
                    <option value="DAY">일별</option>
                    <option value="WEEK">주별</option>
                  </select>
                </label>
              )}
            </div>

            {error && (
              <p role="alert" className="text-label text-status-error">
                {error}
              </p>
            )}
          </div>
          <footer className="gap-2 px-6 py-4 flex shrink-0 items-center border-t border-line-alternative">
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
