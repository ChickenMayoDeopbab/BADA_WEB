import { Link } from 'react-router-dom'
import { routePaths } from '@shared/config'
import { formatDuration } from '@shared/lib'
import { StatusState } from '@shared/ui'
import type { DashboardAnalyticsViewModel } from '../model/useDashboardAnalyticsView'
import {
  AnalyticsPagination,
  AnalyticsQueryState,
  analyticsButtonClass,
  analyticsCardClass,
} from './AnalyticsParts'

/** 통계에서 선택한 기간·상황·조건의 기록을 기존 기록 상세로 연결합니다. */
export const RelatedRecordsPanel = ({ model }: { model: DashboardAnalyticsViewModel }) => (
  <section aria-label="관련 훈련 기록" className={analyticsCardClass}>
    <div className="gap-3 flex flex-wrap items-center justify-between">
      <h3 className="text-headline2 font-bold text-label-normal">관련 훈련 기록</h3>
      {model.hasRecordSelection && (
        <button type="button" onClick={model.handleResetRecords} className={analyticsButtonClass}>
          선택 해제
        </button>
      )}
    </div>
    <p className="mt-2 text-caption text-label-alternative">
      {model.recordFilters.from} ~ {model.recordFilters.to}
      {model.recordFilters.scenarioId && ` · 상황 #${model.recordFilters.scenarioId}`}
      {model.recordFilters.scriptLevel && ` · 힌트 ${model.recordFilters.scriptLevel}단계`}
    </p>
    <AnalyticsQueryState query={model.records} label="관련 훈련 기록을">
      {(data) => (
        <>
          {data.content.length === 0 ? (
            <StatusState title="선택한 조건의 관련 기록이 없어요" />
          ) : (
            <ul className="mt-3 divide-y divide-line-alternative">
              {data.content.map((record) => (
                <li key={record.recordId}>
                  <Link
                    to={`${routePaths.records}?recordId=${record.recordId}&trainedAt=${encodeURIComponent(record.trainedAt)}`}
                    className="gap-3 py-3 flex items-center justify-between rounded-control hover:bg-fill-pressed"
                  >
                    <span className="min-w-0">
                      <span className="block truncate text-body font-bold text-label-normal">
                        {record.scenarioName}
                      </span>
                      <span className="mt-1 block text-caption text-label-alternative">
                        {record.trainedAt.replace('T', ' ')} ·{' '}
                        {formatDuration(record.durationSeconds)}
                      </span>
                    </span>
                    <span className="shrink-0 text-label text-label-neutral">기록 보기 →</span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
          <AnalyticsPagination
            label="관련 기록 페이지"
            page={data.number}
            totalPages={data.totalPages}
            onChange={model.setRecordPage}
          />
        </>
      )}
    </AnalyticsQueryState>
  </section>
)
