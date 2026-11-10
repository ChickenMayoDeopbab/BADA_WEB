import { BiosignalReportSummary } from '@entities/biosignal'
import { Link } from 'react-router-dom'
import { useRecentBiosignalReport } from '../model/useRecentBiosignalReport'

// 가장 최근에 측정한 통화의 몸의 반응을 요약합니다. 측정 기록이 없으면 그리지 않습니다.
export const RecentBiosignalReport = () => {
  const { summary, title, date, recordPath } = useRecentBiosignalReport()
  if (!summary) return null

  return (
    <section className="min-w-0 gap-3 p-5 rounded-2xl flex flex-col bg-fill-normal">
      <div className="gap-4 flex items-start justify-between">
        <div className="min-w-0 gap-0.5 flex flex-col">
          <h2 className="text-headline1 font-bold text-label-normal">{'최근 몸의 반응'}</h2>
          {(title || date) && (
            <p className="truncate text-label text-neutral-60">
              {[title, date].filter(Boolean).join(' · ')}
            </p>
          )}
        </div>
        <Link to={recordPath} className="shrink-0 text-label font-bold text-green-40">
          {'기록 보기 →'}
        </Link>
      </div>
      <BiosignalReportSummary summary={summary} />
    </section>
  )
}
