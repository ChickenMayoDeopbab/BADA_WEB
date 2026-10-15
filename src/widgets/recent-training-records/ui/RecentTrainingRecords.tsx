import { formatTrainingRecord } from '../model/formatTrainingRecord'
import { useTrainingRecordPage } from '@entities/training-record'
import { ListSkeleton, StatusState } from '@shared/ui'
import { routePaths } from '@shared/config'
import { Link } from 'react-router-dom'

const RECENT_RECORD_COUNT = 4

// 최근 훈련 기록 4건과 전체 기록 이동 링크를 표시합니다.
export const RecentTrainingRecords = () => {
  const { data, isPending, isError, refetch, isFetching } = useTrainingRecordPage({
    size: RECENT_RECORD_COUNT,
  })
  const records = (data?.content ?? []).slice(0, RECENT_RECORD_COUNT).map(formatTrainingRecord)

  const emptyMessage = isPending
    ? '훈련 기록을 불러오고 있어요'
    : isError
      ? '훈련 기록을 불러오지 못했어요'
      : '아직 훈련 기록이 없어요'

  return (
    <section className="min-w-0 gap-1.5 p-5 rounded-2xl flex flex-1 flex-col bg-fill-normal">
      <div className="flex items-center justify-between">
        <h2 className="text-headline1 font-bold text-label-normal">최근 훈련 기록</h2>
        <Link to={routePaths.records} className="text-label font-bold text-green-40">
          전체 보기 →
        </Link>
      </div>
      {records.length > 0 ? (
        <ul className="pt-2 flex flex-col divide-y divide-line-alternative">
          {records.map((record) => (
            <li key={record.id}>
              <Link
                to={`${routePaths.records}?recordId=${record.id}&trainedAt=${encodeURIComponent(record.trainedAt)}`}
                aria-label={`${record.title} 기록 보기`}
                className="py-4 gap-4 flex items-center justify-between rounded-control hover:bg-fill-pressed"
              >
                <div className="min-w-0 gap-0.5 flex flex-col">
                  <p className="truncate text-body font-bold text-label-normal">{record.title}</p>
                  <p className="text-label text-neutral-60">{record.meta}</p>
                </div>
                <span className="shrink-0 text-label font-medium text-label-alternative">
                  {record.date}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <div className="flex-1">
          {isPending ? (
            <ListSkeleton count={4} label="훈련 기록을 불러오는 중" />
          ) : (
            <StatusState
              title={emptyMessage}
              isError={isError}
              onRetry={isError ? () => void refetch() : undefined}
              isRetrying={isFetching}
              action={
                !isError ? (
                  <Link to={routePaths.training} className="text-label font-bold text-green-40">
                    훈련 시작하기 →
                  </Link>
                ) : undefined
              }
            />
          )}
        </div>
      )}
    </section>
  )
}
