import type { DashboardAnalyticsViewModel } from '../model/useDashboardAnalyticsView'
import {
  AnalyticsComparisonMetrics,
  AnalyticsConditions,
  AnalyticsQueryState,
  AnalyticsSummary,
  analyticsButtonClass,
} from './AnalyticsParts'

/** 직전 동일 길이 기간의 훈련량과 전체·동일 조건 지표를 비교합니다. */
export const ComparisonPanel = ({ model }: { model: DashboardAnalyticsViewModel }) => (
  <AnalyticsQueryState query={model.comparison} label="기간 비교를">
    {(data) => (
      <div className="space-y-5">
        <p className="text-label text-label-alternative">
          이전 {data.meta.baseline?.from} ~ {data.meta.baseline?.to} / 현재 {data.meta.period.from}{' '}
          ~ {data.meta.period.to}
          {data.meta.period.isPartial && ' (집계 중)'}
        </p>
        <div className="space-y-3">
          <h3 className="text-headline2 font-bold text-label-normal">이전 기간 훈련 현황</h3>
          <AnalyticsSummary summary={data.baselineSummary} />
        </div>
        <div className="space-y-3">
          <h3 className="text-headline2 font-bold text-label-normal">현재 기간 훈련 현황</h3>
          <AnalyticsSummary summary={data.currentSummary} />
        </div>
        <div className="gap-2 flex flex-wrap" role="group" aria-label="비교 방식">
          {(['overall', 'matched'] as const).map((mode) => (
            <button
              key={mode}
              type="button"
              aria-pressed={model.comparisonMode === mode}
              onClick={() => model.setComparisonMode(mode)}
              className={`${analyticsButtonClass} ${model.comparisonMode === mode ? 'bg-primary-alternative' : ''}`}
            >
              {mode === 'overall' ? '전체 비교' : '동일 조건 비교'}
            </button>
          ))}
        </div>
        <p className="text-caption text-label-alternative">
          변화량은 현재 평균에서 이전 평균을 뺀 값이에요. 동일 조건 비교는 상황·버전·난이도·상대
          성격·힌트 단계가 같은 훈련을 사용해요. 비교할 표본이 부족하면 변화량을 표시하지 않아요.
        </p>
        <AnalyticsComparisonMetrics metrics={data.metrics} mode={model.comparisonMode} />
        <details className="text-label text-label-neutral">
          <summary className="cursor-pointer">기간별 훈련 조건 분포</summary>
          <h3 className="mt-3 font-bold">이전 기간</h3>
          <AnalyticsConditions
            conditions={data.baselineConditions}
            onSelect={(condition) =>
              model.handleSelectCondition(condition, data.meta.baseline ?? undefined)
            }
          />
          <h3 className="mt-3 font-bold">현재 기간</h3>
          <AnalyticsConditions
            conditions={data.currentConditions}
            onSelect={model.handleSelectCondition}
          />
        </details>
        <details className="text-label text-label-neutral">
          <summary className="cursor-pointer">기간별 훈련 추이</summary>
          <div className="mt-3 gap-4 md:grid-cols-2 grid">
            {[
              { label: '이전 기간', series: data.baselineSeries },
              { label: '현재 기간', series: data.currentSeries },
            ].map(({ label, series }) => (
              <section key={label}>
                <h3 className="font-bold">{label}</h3>
                <ul className="mt-2 space-y-2">
                  {series.map((point) => (
                    <li key={point.from}>
                      <button
                        type="button"
                        className="text-left underline underline-offset-4"
                        onClick={() => model.handleSelectPeriod(point.from, point.to)}
                      >
                        {point.from} ~ {point.to} · {point.trainingCount}회
                        {point.isPartial && ' (부분 구간)'}
                      </button>
                    </li>
                  ))}
                </ul>
              </section>
            ))}
          </div>
        </details>
      </div>
    )}
  </AnalyticsQueryState>
)
