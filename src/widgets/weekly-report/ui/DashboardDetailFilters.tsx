import type {
  DashboardInterval,
  DashboardPersonality,
  DashboardSessionType,
} from '@entities/dashboard'
import type { DashboardDetailsModel } from '../model/useDashboardDetails'
import { getDashboardToday } from '../model/dashboardDetails'
import { detailButtonClass, detailFieldClass } from './DashboardDetailParts'

/** 날짜와 훈련 조건을 입력하고 명시적으로 적용합니다. */
export const DashboardDetailFilters = ({ model }: { model: DashboardDetailsModel }) => {
  const { draft, setDraft } = model
  return (
    <form onSubmit={model.handleApply} aria-label="통계 상세 조회 조건" className="space-y-3">
      <div className="gap-3 grid grid-cols-2">
        <label className="min-w-0 gap-2 flex flex-col text-label text-label-neutral">
          시작일
          <input
            required
            type="date"
            value={draft.from}
            min="2000-01-01"
            max={getDashboardToday()}
            onChange={(event) => setDraft({ ...draft, from: event.target.value })}
            className={detailFieldClass}
          />
        </label>
        <label className="min-w-0 gap-2 flex flex-col text-label text-label-neutral">
          종료일
          <input
            required
            type="date"
            value={draft.to}
            min={draft.from}
            max={getDashboardToday()}
            onChange={(event) => setDraft({ ...draft, to: event.target.value })}
            className={detailFieldClass}
          />
        </label>
      </div>
      <details className="text-label text-label-neutral">
        <summary className="cursor-pointer">훈련 조건</summary>
        <div className="mt-3 gap-3 grid grid-cols-2">
          <label className="gap-2 flex flex-col">
            훈련 유형
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
            상대 성격
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
        </div>
      </details>
      {model.validationError && (
        <p role="alert" className="text-label text-status-error">
          {model.validationError}
        </p>
      )}
      <button type="submit" className={`${detailButtonClass} bg-primary-normal`}>
        적용하기
      </button>
    </form>
  )
}
