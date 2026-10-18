import type {
  DashboardInterval,
  DashboardPersonality,
  DashboardSessionType,
} from '@entities/dashboard'
import type { DashboardAnalyticsViewModel } from '../model/useDashboardAnalyticsView'
import { getDashboardToday } from '../model/presentation'
import { analyticsButtonClass } from './AnalyticsParts'

const fieldClass =
  'min-w-0 rounded-control border border-line-normal bg-fill-field px-3 py-2 text-label text-label-normal'

/** 기간과 훈련 조건을 입력한 뒤 한 번에 적용합니다. */
export const AnalyticsFilters = ({ model }: { model: DashboardAnalyticsViewModel }) => {
  const { draft, setDraft, handleApply, validationError } = model
  return (
    <form onSubmit={handleApply} aria-label="훈련 통계 조회 조건" className="space-y-3">
      <div className="gap-3 sm:grid-cols-2 xl:grid-cols-4 grid">
        <label className="gap-2 flex flex-col text-label text-label-neutral">
          시작일
          <input
            type="date"
            required
            min="2000-01-01"
            max={getDashboardToday()}
            value={draft.from}
            onChange={(event) => setDraft({ ...draft, from: event.target.value })}
            className={fieldClass}
          />
        </label>
        <label className="gap-2 flex flex-col text-label text-label-neutral">
          종료일
          <input
            type="date"
            required
            min={draft.from}
            max={getDashboardToday()}
            value={draft.to}
            onChange={(event) => setDraft({ ...draft, to: event.target.value })}
            className={fieldClass}
          />
        </label>
        <label className="gap-2 flex flex-col text-label text-label-neutral">
          추이 단위
          <select
            value={draft.interval}
            onChange={(event) =>
              setDraft({ ...draft, interval: event.target.value as DashboardInterval })
            }
            className={fieldClass}
          >
            <option value="DAY">일별</option>
            <option value="WEEK">주별</option>
          </select>
        </label>
        <label className="gap-2 flex flex-col text-label text-label-neutral">
          훈련 유형
          <select
            value={draft.sessionType ?? ''}
            onChange={(event) =>
              setDraft({
                ...draft,
                sessionType: (event.target.value || undefined) as DashboardSessionType | undefined,
              })
            }
            className={fieldClass}
          >
            <option value="">전체</option>
            <option value="SCENARIO">기본 상황</option>
            <option value="CUSTOM">직접 만든 상황</option>
          </select>
        </label>
      </div>
      <details className="text-label text-label-neutral">
        <summary className="py-2 cursor-pointer">훈련 조건 상세</summary>
        <div className="mt-2 gap-3 sm:grid-cols-2 xl:grid-cols-3 grid">
          <label className="gap-2 flex flex-col">
            상황 번호
            <input
              type="number"
              min="1"
              step="1"
              value={draft.scenarioId ?? ''}
              onChange={(event) =>
                setDraft({
                  ...draft,
                  scenarioId: event.target.value ? Number(event.target.value) : undefined,
                })
              }
              className={fieldClass}
              placeholder="전체 상황"
            />
          </label>
          <label className="gap-2 flex flex-col">
            상황 버전
            <input
              maxLength={255}
              value={draft.scenarioVersion ?? ''}
              onChange={(event) =>
                setDraft({ ...draft, scenarioVersion: event.target.value.trim() || undefined })
              }
              className={fieldClass}
              placeholder="전체 버전"
            />
          </label>
          <label className="gap-2 flex flex-col">
            난이도
            <select
              value={draft.difficulty ?? ''}
              onChange={(event) =>
                setDraft({ ...draft, difficulty: event.target.value || undefined })
              }
              className={fieldClass}
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
              className={fieldClass}
            >
              <option value="">전체</option>
              <option value="KIND">친절함</option>
              <option value="NORMAL">보통</option>
              <option value="TOUGH">까다로움</option>
              <option value="RUDE">무례함</option>
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
              className={fieldClass}
            >
              <option value="">전체</option>
              {[1, 2, 3].map((level) => (
                <option key={level} value={level}>
                  {level}단계
                </option>
              ))}
            </select>
          </label>
        </div>
      </details>
      {validationError && (
        <p role="alert" className="text-label text-status-error">
          {validationError}
        </p>
      )}
      <button type="submit" className={`${analyticsButtonClass} bg-primary-normal`}>
        조회하기
      </button>
    </form>
  )
}
