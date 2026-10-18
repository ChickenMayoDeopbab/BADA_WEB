import { DashboardDisclosure } from './DashboardDisclosure'
import type { DashboardDetailsModel } from '../model/useDashboardDetails'
import { formatDuration } from '@shared/lib'
import { StatusState } from '@shared/ui'
import rowArrow from '@shared/assets/training-records/row-arrow.svg'
import { weeklyMetrics } from '../model/buildWeeklyMetricDays'
import {
  formatDashboardMetricValue,
  formatDashboardPeriod,
} from '../model/dashboardMetricPresentation'
import { DashboardMetricSelector } from './DashboardMetricSelector'
import { DashboardMetricComparison } from './DashboardMetricComparison'
import {
  DetailConditions,
  DetailPagination,
  DetailQueryState,
  DetailSummary,
  detailButtonClass,
} from './DashboardDetailParts'

/** 상황 목록과 선택한 상황의 한 지표만 표시하고 부가 정보는 접어둡니다. */
export const DashboardScenarioDetail = ({ model }: { model: DashboardDetailsModel }) => (
  <div className="space-y-5">
    {!model.selectedScenario ? (
      <DetailQueryState query={model.scenarios} label="상황별 현황을">
        {(data) =>
          data.items.length === 0 ? (
            <StatusState title="선택한 조건에서 연습한 상황이 없어요" />
          ) : (
            <>
              <p className="text-label text-label-alternative">
                연습한 상황 {data.totalElements}개
              </p>
              <ul className="divide-y divide-line-alternative">
                {data.items.map((scenario) => (
                  <li key={`${scenario.sessionType}-${scenario.scenarioId}`}>
                    <button
                      type="button"
                      onClick={() => model.handleSelectScenario(scenario)}
                      className="gap-3 py-4 flex w-full items-center justify-between rounded-control text-left hover:bg-fill-normal"
                    >
                      <span className="min-w-0 space-y-1">
                        <span className="block truncate text-body font-bold text-label-normal">
                          {scenario.scenarioName}
                        </span>
                        <span className="block text-caption text-label-alternative">
                          {scenario.sessionType === 'CUSTOM' ? '직접 만든 상황' : '기본 상황'} ·{' '}
                          {scenario.summary.trainingCount}회 ·{' '}
                          {formatDuration(scenario.summary.totalDurationSeconds)}
                        </span>
                      </span>
                      <img src={rowArrow} alt="" className="shrink-0" />
                    </button>
                  </li>
                ))}
              </ul>
              <DetailPagination
                page={data.page}
                totalPages={data.totalPages}
                label="상황 목록 페이지"
                onChange={model.setScenarioPage}
              />
            </>
          )
        }
      </DetailQueryState>
    ) : (
      <>
        <div className="gap-3 flex flex-wrap items-center justify-between">
          <button type="button" className={detailButtonClass} onClick={model.handleClearScenario}>
            ← 상황 목록
          </button>
          <h3 className="text-headline2 font-bold text-label-normal">
            {model.selectedScenario.scenarioName}
          </h3>
        </div>
        <DashboardMetricSelector value={model.seriesMetric} onChange={model.setSeriesMetric} />
        <DetailQueryState query={model.scenarioDetail} label="상황별 추이를">
          {(data) => {
            const scenario = data.items[0]
            const selectedMetric = weeklyMetrics.find(({ key }) => key === model.seriesMetric)!
            if (!scenario) return <StatusState title="이 상황의 훈련 기록이 없어요" />
            const comparison = scenario.comparison.find(({ key }) => key === model.seriesMetric)
            const series = scenario.series.filter(({ trainingCount }) => trainingCount > 0)
            return (
              <div className="space-y-5">
                {comparison ? (
                  <DashboardMetricComparison
                    metric={comparison}
                    model={model}
                    periods={{ baseline: data.meta.baseline, current: data.meta.period }}
                  />
                ) : (
                  <section className="space-y-2 p-5 rounded-card bg-fill-normal">
                    <h4 className="text-headline2 font-bold text-label-normal">
                      {selectedMetric.label} 평균
                    </h4>
                    <p className="text-caption text-label-alternative">
                      {selectedMetric.description}
                    </p>
                    <p className="text-title1 font-bold text-label-normal">
                      {formatDashboardMetricValue(
                        scenario.metrics[model.seriesMetric],
                        selectedMetric.unit,
                      )}
                    </p>
                  </section>
                )}
                <DashboardDisclosure title="날짜별 변화">
                  <p className="mt-2 text-caption text-label-alternative">
                    훈련한 날만 표시해요. 날짜를 누르면 해당 훈련 기록을 볼 수 있어요.
                  </p>
                  {series.length ? (
                    <ul className="mt-2 divide-y divide-line-alternative">
                      {series.map((point) => (
                        <li key={point.from}>
                          <button
                            type="button"
                            aria-label={`${formatDashboardPeriod(point)} 훈련 기록`}
                            onClick={() => model.handleSelectPeriod(point)}
                            className="gap-3 py-3 flex w-full items-center justify-between text-left hover:bg-fill-normal"
                          >
                            <span className="text-label text-label-alternative">
                              {formatDashboardPeriod(point)}
                            </span>
                            <span className="gap-3 flex items-center font-bold text-label-normal">
                              {formatDashboardMetricValue(
                                point.metrics[model.seriesMetric],
                                selectedMetric.unit,
                              )}
                              <img src={rowArrow} alt="" />
                            </span>
                          </button>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="mt-3 text-caption text-label-alternative">
                      날짜별로 표시할 측정 기록이 없어요.
                    </p>
                  )}
                </DashboardDisclosure>
                <DashboardDisclosure title="연습한 설정별 기록">
                  <p className="mt-2 text-caption text-label-alternative">
                    난이도·상대 말투·힌트별로 훈련 기록을 볼 수 있어요.
                  </p>
                  <DetailConditions
                    items={scenario.conditionBreakdown}
                    onSelect={(condition) => model.handleSelectCondition(condition)}
                  />
                </DashboardDisclosure>
                <DashboardDisclosure title="훈련량 함께 보기">
                  <DetailSummary summary={scenario.summary} />
                  <p className="mt-3 text-caption text-label-alternative">
                    처음 연습한 날 {scenario.firstTrainedAt?.slice(0, 10) ?? '기록 없음'}
                    <br />
                    최근 연습한 날 {scenario.lastTrainedAt.slice(0, 10)}
                  </p>
                </DashboardDisclosure>
              </div>
            )
          }}
        </DetailQueryState>
      </>
    )}
  </div>
)
