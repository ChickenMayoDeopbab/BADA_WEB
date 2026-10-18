import type { DashboardAnalyticsViewModel } from '../model/useDashboardAnalyticsView'
import {
  AnalyticsMetricCards,
  AnalyticsQueryState,
  AnalyticsSeries,
  AnalyticsSummary,
  analyticsCardClass,
} from './AnalyticsParts'
import { StatusState } from '@shared/ui'

/** 훈련량, 상황 경험, 힌트 분포와 지표의 기간별 변화를 표시합니다. */
export const OverviewPanel = ({ model }: { model: DashboardAnalyticsViewModel }) => (
  <AnalyticsQueryState query={model.overview} label="훈련 통계를">
    {(data) => (
      <div className="space-y-5">
        <AnalyticsSummary summary={data.summary} />
        <div className="gap-3 md:grid-cols-3 grid">
          <div className={analyticsCardClass}>
            <h3 className="text-label text-label-alternative">연습한 상황</h3>
            <p className="mt-2 text-headline1 font-bold text-label-normal">
              {data.experience.scenarioCount}개
            </p>
          </div>
          <div className={analyticsCardClass}>
            <h3 className="text-label text-label-alternative">새롭게 시도한 상황</h3>
            <p className="mt-2 text-headline1 font-bold text-label-normal">
              {data.experience.newScenarioCount}개
            </p>
          </div>
          <div className={analyticsCardClass}>
            <h3 className="text-label text-label-alternative">힌트 단계별 훈련</h3>
            <ul className="mt-2 space-y-1 text-label text-label-neutral">
              {Object.entries(data.hintSettings).map(([level, count]) => (
                <li key={level}>
                  {level === 'UNKNOWN' ? '단계 정보 없음' : `${level}단계`} · {count}회
                </li>
              ))}
            </ul>
          </div>
        </div>
        {data.experience.unknownScenarioTrainingCount > 0 && (
          <p className="text-caption text-label-alternative">
            상황 정보가 없는 훈련 {data.experience.unknownScenarioTrainingCount}회는 상황 수에
            포함되지 않아요.
          </p>
        )}
        {data.summary.trainingCount === 0 && (
          <StatusState
            title="선택한 기간과 조건의 훈련이 없어요"
            description="다른 기간을 선택하거나 훈련을 시작해 보세요."
          />
        )}
        <div className="space-y-3">
          <h3 className="text-headline2 font-bold text-label-normal">지표 평균</h3>
          <AnalyticsMetricCards metrics={data.metrics} />
          <p className="text-caption text-label-alternative">
            훈련 {data.coverage.trainingCount}건 중 불안 점수 입력 {data.coverage.selfReportCount}건
            · 음성 지표는 통화별 측정값의 평균이에요. 측정 기록이 없으면 —로 표시해요.
          </p>
        </div>
        <AnalyticsSeries series={data.series} onSelectPeriod={model.handleSelectPeriod} />
        <section className={analyticsCardClass}>
          <h3 className="text-headline2 font-bold text-label-normal">날짜별 훈련 횟수</h3>
          <p className="mt-1 text-caption text-label-alternative">
            날짜를 누르면 아래에서 해당 날짜의 기록을 확인할 수 있어요.
          </p>
          <ul className="mt-3 gap-2 sm:grid-cols-4 xl:grid-cols-7 grid grid-cols-2">
            {data.activity.map(({ date, trainingCount }) => (
              <li key={date}>
                <button
                  type="button"
                  onClick={() => model.handleSelectPeriod(date)}
                  className={`gap-1 p-3 flex w-full flex-col rounded-control border border-line-alternative text-left text-label text-label-normal hover:bg-fill-pressed ${trainingCount > 0 ? 'bg-primary-alternative' : 'bg-background-normal'}`}
                >
                  <span>{date.slice(5)}</span>
                  <span className="font-bold">{trainingCount}회</span>
                </button>
              </li>
            ))}
          </ul>
        </section>
        <p className="text-caption text-label-alternative">
          {data.meta.timeZone} 기준 · {data.meta.period.from} ~ {data.meta.period.to}
          {data.meta.period.isPartial && ' · 오늘 기록은 집계 중이에요.'}
        </p>
      </div>
    )}
  </AnalyticsQueryState>
)
