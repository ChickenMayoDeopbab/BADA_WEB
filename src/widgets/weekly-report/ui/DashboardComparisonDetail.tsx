import type { DashboardDetailsModel } from '../model/useDashboardDetails'
import { formatDashboardPeriod } from '../model/dashboardMetricPresentation'
import { DashboardMetricSelector } from './DashboardMetricSelector'
import { DashboardMetricComparison } from './DashboardMetricComparison'
import { DetailQueryState, DetailSummary } from './DashboardDetailParts'

/** 한 지표씩 이전 같은 길이의 기간과 비교하고 훈련량은 접어서 표시합니다. */
export const DashboardComparisonDetail = ({ model }: { model: DashboardDetailsModel }) => (
  <div className="space-y-5">
    <DashboardMetricSelector value={model.seriesMetric} onChange={model.setSeriesMetric} />
    <DetailQueryState query={model.comparison} label="기간 비교를">
      {(data) => (
        <div className="space-y-5">
          <DashboardMetricComparison
            metric={data.metrics.find(({ key }) => key === model.seriesMetric)}
            model={model}
            periods={{ baseline: data.meta.baseline, current: data.meta.period }}
          />
          <details className="text-label text-label-neutral">
            <summary className="cursor-pointer">훈련량 함께 보기</summary>
            <div className="mt-3 gap-4 grid grid-cols-2">
              {[
                { label: '이전 기간', period: data.meta.baseline, summary: data.baselineSummary },
                { label: '현재 기간', period: data.meta.period, summary: data.currentSummary },
              ].map(({ label, period, summary }) => (
                <section key={label} className="min-w-0">
                  <h3 className="text-label font-bold text-label-normal">{label}</h3>
                  <DetailSummary summary={summary} />
                  {period && (
                    <button
                      type="button"
                      className="mt-3 text-caption text-label-neutral underline underline-offset-4"
                      onClick={() => model.handleSelectPeriod(period)}
                    >
                      {label} 기록
                      <span className="mt-1 block text-label-alternative">
                        {formatDashboardPeriod(period)}
                      </span>
                    </button>
                  )}
                </section>
              ))}
            </div>
          </details>
        </div>
      )}
    </DetailQueryState>
  </div>
)
