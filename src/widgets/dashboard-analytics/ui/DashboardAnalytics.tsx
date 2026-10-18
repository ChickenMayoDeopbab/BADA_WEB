import { useDashboardAnalyticsView, type DashboardTab } from '../model/useDashboardAnalyticsView'
import { AnalyticsFilters } from './AnalyticsFilters'
import { ComparisonPanel } from './ComparisonPanel'
import { OverviewPanel } from './OverviewPanel'
import { ScenariosPanel } from './ScenariosPanel'
import { RelatedRecordsPanel } from './RelatedRecordsPanel'
import { StatusState } from '@shared/ui'

const tabs: Array<{ value: DashboardTab; label: string }> = [
  { value: 'overview', label: '전체 개요' },
  { value: 'comparison', label: '기간 비교' },
  { value: 'scenarios', label: '상황별 현황' },
]

/** 기간·조건별 통계 조회와 관련 기록 탐색을 구성합니다. */
export const DashboardAnalytics = () => {
  const model = useDashboardAnalyticsView()
  return (
    <section aria-label="훈련 통계" className="min-w-0 space-y-5">
      <div>
        <h2 className="text-title2 font-bold text-label-normal">훈련 통계</h2>
        <p className="mt-2 text-label text-label-alternative">
          기간과 훈련 조건에 따른 변화를 살펴보세요.
        </p>
      </div>
      <AnalyticsFilters model={model} />
      <div
        className="gap-2 flex border-b border-line-alternative"
        role="group"
        aria-label="통계 보기"
      >
        {tabs.map(({ value, label }) => (
          <button
            key={value}
            type="button"
            aria-pressed={model.tab === value}
            onClick={() => model.setTab(value)}
            className={`px-4 py-3 border-b-2 text-label font-bold ${model.tab === value ? 'border-primary-normal text-label-normal' : 'border-transparent text-label-alternative'}`}
          >
            {label}
          </button>
        ))}
      </div>
      {model.tab !== 'overview' && !model.canCompare ? (
        <StatusState
          title="이전 비교 기간을 조회할 수 없어요"
          description="이전 동일 길이 기간이 2000년 이후가 되도록 조회 기간을 선택해 주세요."
        />
      ) : model.tab === 'overview' ? (
        <OverviewPanel model={model} />
      ) : model.tab === 'comparison' ? (
        <ComparisonPanel model={model} />
      ) : (
        <ScenariosPanel model={model} />
      )}
      <RelatedRecordsPanel model={model} />
    </section>
  )
}
