import { useState } from 'react'
import { Link } from 'react-router-dom'
import { IoCallOutline } from 'react-icons/io5'
import type { TrainingRecordSummary } from '@entities/training-record'
import { routePaths } from '@shared/config'
import { formatDuration } from '@shared/lib'
import { StatusState } from '@shared/ui'
import rowArrow from '@shared/assets/training-records/row-arrow.svg'
import type { DashboardDetailsModel } from '../model/useDashboardDetails'
import { DetailPagination, DetailQueryState, detailButtonClass } from './DashboardDetailParts'

/** 기록 API의 카테고리 아이콘을 우선 사용하고 이미지가 없으면 통화 아이콘을 표시합니다. */
const RecordIcon = ({ record }: { record: TrainingRecordSummary }) => {
  const source = record.categoryIconUrl || record.scenarioImage
  const [failedSource, setFailedSource] = useState<string | null>(null)
  return (
    <span
      className="size-11 flex shrink-0 items-center justify-center overflow-hidden rounded-component bg-fill-normal text-label-neutral"
      aria-hidden="true"
    >
      {source && source !== failedSource ? (
        <img
          src={source}
          alt=""
          className="size-full object-cover"
          onError={() => setFailedSource(source)}
        />
      ) : (
        <IoCallOutline size={24} />
      )}
    </span>
  )
}

/** 관련 기록을 아이콘·훈련명·통화 시간·화살표로 표시하고 기존 상세로 연결합니다. */
export const DashboardRelatedRecords = ({ model }: { model: DashboardDetailsModel }) => (
  <section aria-label="관련 훈련 기록" className="space-y-3 pt-5 border-t border-line-alternative">
    <div className="gap-2 flex flex-wrap items-center justify-between">
      <h3 className="text-headline2 font-bold text-label-normal">관련 훈련 기록</h3>
      {model.hasRecordSelection && (
        <button type="button" className={detailButtonClass} onClick={model.handleResetRecords}>
          선택 해제
        </button>
      )}
    </div>
    <DetailQueryState query={model.records} label="관련 기록을">
      {(data) => (
        <>
          {data.content.length === 0 ? (
            <StatusState title="관련 훈련 기록이 없어요" />
          ) : (
            <ul className="divide-y divide-line-alternative">
              {data.content.map((record) => (
                <li key={record.recordId}>
                  <Link
                    to={`${routePaths.records}?recordId=${record.recordId}&trainedAt=${encodeURIComponent(record.trainedAt)}`}
                    aria-label={`${record.scenarioName}, 통화 시간 ${formatDuration(record.durationSeconds)}`}
                    className="gap-3 py-3 flex items-center rounded-control hover:bg-fill-pressed"
                  >
                    <RecordIcon record={record} />
                    <span className="min-w-0 flex-1 truncate text-body font-bold text-label-normal">
                      {record.scenarioName}
                    </span>
                    <span className="shrink-0 text-caption text-label-alternative">
                      {formatDuration(record.durationSeconds)}
                    </span>
                    <img src={rowArrow} alt="" className="shrink-0" />
                  </Link>
                </li>
              ))}
            </ul>
          )}
          <DetailPagination
            page={data.number}
            totalPages={data.totalPages}
            label="관련 기록 페이지"
            onChange={model.setRecordPage}
          />
        </>
      )}
    </DetailQueryState>
  </section>
)
