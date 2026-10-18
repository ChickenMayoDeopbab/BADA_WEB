import type { DashboardAnalyticsViewModel } from '../model/useDashboardAnalyticsView'
import { formatDuration } from '@shared/lib'
import { StatusState } from '@shared/ui'
import {
  AnalyticsComparisonMetrics,
  AnalyticsConditions,
  AnalyticsMetricCards,
  AnalyticsPagination,
  AnalyticsQueryState,
  AnalyticsSeries,
  analyticsCardClass,
} from './AnalyticsParts'

/** 상황 목록과 선택한 상황의 조건 분포·지표·추이를 표시합니다. */
export const ScenariosPanel = ({ model }: { model: DashboardAnalyticsViewModel }) => (
  <div className="space-y-5">
    <AnalyticsQueryState query={model.scenarios} label="상황별 현황을">
      {(data) =>
        data.items.length === 0 ? (
          <StatusState title="선택한 조건에서 연습한 상황이 없어요" />
        ) : (
          <>
            <p className="mb-3 text-label text-label-alternative">
              총 {data.totalElements}개 상황 · 상황을 선택하면 상세 추이와 관련 기록을 볼 수 있어요.
            </p>
            <ul className="space-y-3">
              {data.items.map((scenario) => (
                <li key={`${scenario.sessionType}-${scenario.scenarioId}`}>
                  <button
                    type="button"
                    aria-pressed={
                      model.selectedScenario?.scenarioId === scenario.scenarioId &&
                      model.selectedScenario?.sessionType === scenario.sessionType
                    }
                    onClick={() => model.handleSelectScenario(scenario)}
                    className={`w-full border border-line-alternative text-left hover:bg-fill-pressed ${analyticsCardClass}`}
                  >
                    <span className="text-body font-bold text-label-normal">
                      {scenario.scenarioName}
                    </span>
                    <span className="ml-2 text-caption text-label-alternative">
                      {scenario.sessionType === 'CUSTOM' ? '직접 만든 상황' : '기본 상황'}
                    </span>
                    <span className="mt-2 block text-label text-label-neutral">
                      {scenario.summary.trainingCount}회 ·{' '}
                      {formatDuration(scenario.summary.totalDurationSeconds)}
                    </span>
                    <span className="mt-2 block text-caption text-label-alternative">
                      최초 {scenario.firstTrainedAt?.replace('T', ' ') ?? '정보 없음'} · 최근{' '}
                      {scenario.lastTrainedAt.replace('T', ' ')}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
            <AnalyticsPagination
              label="상황 목록 페이지"
              page={data.page}
              totalPages={data.totalPages}
              onChange={model.setScenarioPage}
            />
          </>
        )
      }
    </AnalyticsQueryState>
    {model.selectedScenario && (
      <section className="space-y-3 pt-5 border-t border-line-alternative">
        <h3 className="text-headline1 font-bold text-label-normal">
          {model.selectedScenario.scenarioName} 상세
        </h3>
        <AnalyticsQueryState query={model.scenarioDetail} label="상황별 추이를">
          {(data) => {
            const scenario = data.items[0]
            if (!scenario) return <StatusState title="선택한 상황의 훈련 기록이 없어요" />
            return (
              <div className="space-y-4">
                <AnalyticsMetricCards metrics={scenario.metrics} />
                <AnalyticsSeries
                  series={scenario.series}
                  onSelectPeriod={(from, to) => model.handleSelectPeriod(from, to, scenario)}
                />
                <h4 className="text-headline2 font-bold text-label-normal">
                  이전 동일 길이 기간과 비교
                </h4>
                <div className="gap-2 flex" role="group" aria-label="상황 비교 방식">
                  {(['overall', 'matched'] as const).map((mode) => (
                    <button
                      key={mode}
                      type="button"
                      aria-pressed={model.comparisonMode === mode}
                      onClick={() => model.setComparisonMode(mode)}
                      className="px-4 py-2 rounded-control bg-fill-neutral text-label text-label-normal"
                    >
                      {mode === 'overall' ? '전체 비교' : '동일 조건 비교'}
                    </button>
                  ))}
                </div>
                <AnalyticsComparisonMetrics
                  metrics={scenario.comparison}
                  mode={model.comparisonMode}
                />
                <h4 className="text-headline2 font-bold text-label-normal">훈련 조건별 분포</h4>
                <AnalyticsConditions
                  conditions={scenario.conditionBreakdown}
                  onSelect={model.handleSelectCondition}
                />
              </div>
            )
          }}
        </AnalyticsQueryState>
      </section>
    )}
  </div>
)
