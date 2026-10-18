import type { DashboardMetricKey } from '@entities/dashboard'
import type { DashboardDetailsModel } from '../model/useDashboardDetails'
import { formatDuration } from '@shared/lib'
import { StatusState } from '@shared/ui'
import { formatWeeklyMetric, weeklyMetrics } from '../model/buildWeeklyMetricDays'
import {
  DetailComparisonMetrics,
  DetailComparisonMode,
  DetailConditions,
  DetailPagination,
  DetailQueryState,
  detailButtonClass,
  detailFieldClass,
} from './DashboardDetailParts'

/** 연습한 상황의 목록과 선택한 상황의 지표·조건·추이를 표시합니다. */
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
                총 {data.totalElements}개 상황 · 상황을 선택해 상세 기록을 확인하세요.
              </p>
              <ul className="mt-3 space-y-3">
                {data.items.map((scenario) => (
                  <li key={`${scenario.sessionType}-${scenario.scenarioId}`}>
                    <button
                      type="button"
                      onClick={() => model.handleSelectScenario(scenario)}
                      className="p-4 w-full rounded-component bg-fill-normal text-left hover:bg-fill-pressed"
                    >
                      <span className="block text-body font-bold text-label-normal">
                        {scenario.scenarioName}
                      </span>
                      <span className="mt-1 block text-label text-label-neutral">
                        {scenario.sessionType === 'CUSTOM' ? '직접 만든 상황' : '기본 상황'} ·{' '}
                        {scenario.summary.trainingCount}회 ·{' '}
                        {formatDuration(scenario.summary.totalDurationSeconds)}
                      </span>
                      <span className="mt-2 block text-caption text-label-alternative">
                        최초 {scenario.firstTrainedAt?.replace('T', ' ') ?? '정보 없음'}
                        <br />
                        최근 {scenario.lastTrainedAt.replace('T', ' ')}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
              <div className="mt-4">
                <DetailPagination
                  page={data.page}
                  totalPages={data.totalPages}
                  label="상황 목록 페이지"
                  onChange={model.setScenarioPage}
                />
              </div>
            </>
          )
        }
      </DetailQueryState>
    ) : (
      <>
        <button type="button" className={detailButtonClass} onClick={model.handleClearScenario}>
          ← 상황 목록
        </button>
        <h3 className="text-headline1 font-bold text-label-normal">
          {model.selectedScenario.scenarioName}
        </h3>
        <DetailQueryState query={model.scenarioDetail} label="상황별 추이를">
          {(data) => {
            const scenario = data.items[0]
            const selectedMetric = weeklyMetrics.find(({ key }) => key === model.seriesMetric)!
            if (!scenario) return <StatusState title="이 상황의 훈련 기록이 없어요" />
            return (
              <div className="space-y-5">
                <dl className="gap-3 grid grid-cols-2">
                  {weeklyMetrics.map((metric) => (
                    <div key={metric.key} className="min-w-0 p-3 rounded-component bg-fill-normal">
                      <dt className="text-label text-label-alternative">{metric.label} 평균</dt>
                      <dd className="mt-1 text-body font-bold break-words text-label-normal">
                        {formatWeeklyMetric(scenario.metrics[metric.key], metric.unit)}
                      </dd>
                    </div>
                  ))}
                </dl>
                <section className="space-y-3">
                  <h4 className="text-headline2 font-bold text-label-normal">지표 추이</h4>
                  <label className="gap-2 flex flex-col text-label text-label-neutral">
                    조회할 지표
                    <select
                      className={detailFieldClass}
                      value={model.seriesMetric}
                      onChange={(event) =>
                        model.setSeriesMetric(event.target.value as DashboardMetricKey)
                      }
                    >
                      {weeklyMetrics.map(({ key, label }) => (
                        <option key={key} value={key}>
                          {label}
                        </option>
                      ))}
                    </select>
                  </label>
                  <ul className="divide-y divide-line-alternative">
                    {scenario.series.map((point) => (
                      <li key={point.from}>
                        <button
                          type="button"
                          onClick={() => model.handleSelectPeriod(point)}
                          className="gap-2 py-3 flex w-full flex-wrap justify-between text-left text-label text-label-neutral"
                        >
                          <span>
                            {point.from} ~ {point.to}
                            {point.isPartial && ' (부분 구간)'}
                            <span className="mt-1 block text-caption text-label-alternative">
                              {point.trainingCount}회 훈련 · 관련 기록 →
                            </span>
                          </span>
                          <span className="font-bold">
                            {formatWeeklyMetric(
                              point.metrics[model.seriesMetric],
                              selectedMetric.unit,
                            )}
                          </span>
                        </button>
                      </li>
                    ))}
                  </ul>
                </section>
                <section className="space-y-3">
                  <h4 className="text-headline2 font-bold text-label-normal">이전 기간과 비교</h4>
                  <DetailComparisonMode mode={model.mode} onChange={model.setMode} />
                  <DetailComparisonMetrics metrics={scenario.comparison} mode={model.mode} />
                </section>
                <details className="text-label text-label-neutral">
                  <summary className="cursor-pointer">훈련 조건별 분포</summary>
                  <DetailConditions
                    items={scenario.conditionBreakdown}
                    onSelect={(condition) => model.handleSelectCondition(condition)}
                  />
                </details>
              </div>
            )
          }}
        </DetailQueryState>
      </>
    )}
  </div>
)
