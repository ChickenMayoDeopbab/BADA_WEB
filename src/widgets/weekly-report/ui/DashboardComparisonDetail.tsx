import type { DashboardDetailsModel } from '../model/useDashboardDetails'
import {
  DetailComparisonMetrics,
  DetailComparisonMode,
  DetailConditions,
  DetailQueryState,
  DetailSummary,
  detailButtonClass,
} from './DashboardDetailParts'

/** 직전 동일 길이 기간과 훈련량 및 지표를 비교합니다. */
export const DashboardComparisonDetail = ({ model }: { model: DashboardDetailsModel }) => (
  <DetailQueryState query={model.comparison} label="기간 비교를">
    {(data) => (
      <div className="space-y-5">
        <p className="text-label text-label-alternative">
          이전 {data.meta.baseline?.from} ~ {data.meta.baseline?.to}
          <br />
          현재 {data.meta.period.from} ~ {data.meta.period.to}
          {data.meta.period.isPartial && ' (집계 중)'}
        </p>
        <div className="gap-3 grid grid-cols-2">
          {[
            { label: '이전 기간', period: data.meta.baseline, summary: data.baselineSummary },
            { label: '현재 기간', period: data.meta.period, summary: data.currentSummary },
          ].map(({ label, period, summary }) => (
            <section key={label} className="min-w-0 p-3 rounded-component bg-fill-normal">
              <h3 className="text-body font-bold text-label-normal">{label}</h3>
              <DetailSummary summary={summary} />
              {period && (
                <button
                  type="button"
                  className={`mt-3 ${detailButtonClass}`}
                  onClick={() => model.handleSelectPeriod(period)}
                >
                  {label} 기록
                </button>
              )}
            </section>
          ))}
        </div>
        <DetailComparisonMode mode={model.mode} onChange={model.setMode} />
        <p className="text-caption text-label-alternative">
          변화량은 현재 평균에서 이전 평균을 뺀 값이에요. 동일 조건 비교는 같은
          유형·상황·버전·난이도·성격·힌트 단계의 훈련을 사용해요. 표본이 부족하면 변화량을 표시하지
          않아요.
        </p>
        <DetailComparisonMetrics metrics={data.metrics} mode={model.mode} />
        <details className="text-label text-label-neutral">
          <summary className="cursor-pointer">훈련 조건별 분포</summary>
          <h3 className="mt-3 font-bold">이전 기간 조건</h3>
          <DetailConditions
            items={data.baselineConditions}
            onSelect={(condition) =>
              model.handleSelectCondition(condition, data.meta.baseline ?? undefined)
            }
          />
          <h3 className="mt-3 font-bold">현재 기간 조건</h3>
          <DetailConditions
            items={data.currentConditions}
            onSelect={(condition) => model.handleSelectCondition(condition)}
          />
        </details>
        <details className="text-label text-label-neutral">
          <summary className="cursor-pointer">기간별 훈련 횟수</summary>
          {[
            { label: '이전 기간', series: data.baselineSeries },
            { label: '현재 기간', series: data.currentSeries },
          ].map(({ label, series }) => (
            <section key={label} className="mt-3">
              <h3 className="font-bold">{label}</h3>
              <ul className="mt-2 space-y-2">
                {series.map((point) => (
                  <li key={point.from}>
                    <button
                      type="button"
                      className="text-left underline underline-offset-4"
                      onClick={() => model.handleSelectPeriod(point)}
                    >
                      {point.from} ~ {point.to} · {point.trainingCount}회
                      {point.isPartial && ' (부분 구간)'}
                    </button>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </details>
      </div>
    )}
  </DetailQueryState>
)
