import type { Page } from '@playwright/test'
import type {
  DashboardComparison,
  DashboardMetricComparison,
  DashboardScenario,
} from '../../src/entities/dashboard/index'
import { makeWeeklyOverview, prepareWeeklyDashboard } from './weeklyDashboardFixture'

const condition = {
  sessionType: 'CUSTOM' as const,
  scenarioId: 7,
  scenarioVersion: 'v2',
  difficulty: 'low',
  aiPersonality: 'KIND' as const,
  scriptLevel: 2,
}

/** 같은 시나리오의 이전·현재 평균과 비교 불가 표본을 포함하는 응답을 만듭니다. */
const makeComparison = (from: string, to: string): DashboardComparison => {
  const overview = makeWeeklyOverview(from, to)
  const start = Date.parse(`${from}T00:00:00Z`)
  const days = Math.round((Date.parse(`${to}T00:00:00Z`) - start) / 86_400_000) + 1
  const baselineFrom = new Date(start - days * 86_400_000).toISOString().slice(0, 10)
  const baselineTo = new Date(start - 86_400_000).toISOString().slice(0, 10)
  const metrics = Object.entries(overview.metrics).map(([key, metric]) => {
    const deltaUnit =
      metric.unit === 'SCORE_0_10'
        ? 'POINT'
        : metric.unit === 'MILLISECOND'
          ? 'MILLISECOND'
          : 'PERCENTAGE_POINT'
    const delta = metric.unit === 'SCORE_0_10' ? -2 : metric.unit === 'MILLISECOND' ? -200 : -20
    const excluded = {
      ...metric,
      value: null,
      sampleCount: 0,
      status: 'NOT_COMPARABLE' as const,
      exclusionReasons: { NO_SHARED_CONDITION: 3 },
    }
    return {
      key,
      unit: metric.unit,
      deltaUnit,
      overall: {
        baseline: { ...metric, value: metric.value === null ? null : metric.value - delta },
        current: metric,
        delta: metric.value === null ? null : delta,
        status: metric.status,
      },
      matched: {
        baseline: excluded,
        current: excluded,
        delta: null,
        status: 'NOT_COMPARABLE',
        conditionCount: 0,
        conditions: [],
      },
    }
  }) as DashboardMetricComparison[]
  return {
    meta: {
      ...overview.meta,
      baseline: { from: baselineFrom, to: baselineTo, isPartial: false },
    },
    baselineSummary: overview.summary,
    currentSummary: overview.summary,
    metrics,
    baselineConditions: [{ condition, trainingCount: 3 }],
    currentConditions: [{ condition, trainingCount: 3 }],
    baselineSeries: [],
    currentSeries: [],
  }
}

/** 통계 상세와 기존 기록 화면을 같은 API 계약으로 검증합니다. */
export const prepareDashboardDetails = async (page: Page) => {
  const audit = await prepareWeeklyDashboard(page)
  const requests: URL[] = []
  let failures = 0
  let isEmpty = false
  await page.route('**/api/v1/dashboard/comparison?*', (route) => {
    const url = new URL(route.request().url())
    requests.push(url)
    if (failures > 0) {
      failures--
      return route.fulfill({ status: 503, json: { message: '조회 실패' } })
    }
    return route.fulfill({
      json: { data: makeComparison(url.searchParams.get('from')!, url.searchParams.get('to')!) },
    })
  })
  await page.route('**/api/v1/dashboard/scenarios?*', (route) => {
    const url = new URL(route.request().url())
    requests.push(url)
    const overview = makeWeeklyOverview(url.searchParams.get('from')!, url.searchParams.get('to')!)
    const scenario: DashboardScenario = {
      scenarioId: 7,
      sessionType: 'CUSTOM',
      scenarioName: '식당 예약',
      summary: overview.summary,
      firstTrainedAt: '2026-09-01T12:00:00',
      lastTrainedAt: `${overview.meta.period.to}T12:00:00`,
      conditionBreakdown: [{ condition, trainingCount: 3 }],
      metrics: overview.metrics,
      comparison: makeComparison(overview.meta.period.from, overview.meta.period.to).metrics,
      series: url.searchParams.get('includeSeries') === 'true' ? overview.series : [],
    }
    return route.fulfill({
      json: {
        data: {
          meta: overview.meta,
          items: isEmpty ? [] : [scenario],
          page: Number(url.searchParams.get('page')),
          size: Number(url.searchParams.get('size')),
          totalElements: isEmpty ? 0 : 6,
          totalPages: isEmpty ? 0 : 2,
        },
      },
    })
  })
  await page.route('**/api/v1/training-records?*', (route) => {
    const url = new URL(route.request().url())
    requests.push(url)
    const recordId = 42 + Number(url.searchParams.get('page') ?? 0)
    return route.fulfill({
      json: {
        data: {
          content: isEmpty
            ? []
            : [
                {
                  recordId,
                  sessionId: `s${recordId}`,
                  trainedAt: '2026-10-01T12:00:00',
                  scenarioName: '식당 예약',
                  sessionType: 'CUSTOM',
                  durationSeconds: 60,
                },
              ],
          number: Number(url.searchParams.get('page') ?? 0),
          size: Number(url.searchParams.get('size')),
          totalElements: isEmpty ? 0 : 6,
          totalPages: isEmpty ? 0 : url.searchParams.get('size') === '100' ? 1 : 2,
        },
      },
    })
  })
  await page.route('**/api/v1/training-records/42', (route) =>
    route.fulfill({
      json: {
        data: {
          recordId: 42,
          sessionId: 's42',
          trainedAt: '2026-10-01T12:00:00',
          scenarioName: '식당 예약',
          sessionType: 'CUSTOM',
          scenarioId: 7,
          aiPersonality: 'KIND',
          durationSeconds: 60,
          transcript: [],
          positiveFeedbacks: [],
        },
      },
    }),
  )
  return {
    ...audit,
    requests,
    failComparison: (count: number) => {
      failures = count
    },
    setEmpty: () => {
      isEmpty = true
    },
  }
}
