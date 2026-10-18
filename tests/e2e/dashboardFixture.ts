import type { Page } from '@playwright/test'
import type { DashboardMetricKey, DashboardMetricValues } from '../../src/entities/dashboard/index'
import { authenticate } from './authFixture'

const metricKeys: DashboardMetricKey[] = [
  'selfReportedAnxiety',
  'tremorTurnRate',
  'longPauseTurnRate',
  'quietDropTurnRate',
  'fastRateTurnRate',
  'responseDelayMs',
]
/** 측정 가능한 0과 결측값을 구분하는 지표 응답을 만듭니다. */
const metric = (key: DashboardMetricKey, value: number | null = 0) => ({
  value,
  unit:
    key === 'selfReportedAnxiety'
      ? 'SCORE_0_10'
      : key === 'responseDelayMs'
        ? 'MILLISECOND'
        : 'PERCENT',
  aggregation: 'MEAN_OF_SESSION_RATES',
  sampleCount: value === null ? 0 : 3,
  eligibleTurnCount: 9,
  status: value === null ? 'NO_DATA' : 'READY',
  exclusionReasons: value === null ? { MISSING_SPEECH_METRICS: 3 } : {},
})
export const dashboardFixtureMetrics = Object.fromEntries(
  metricKeys.map((key) => [key, metric(key, key === 'responseDelayMs' ? null : 0)]),
) as DashboardMetricValues
const summary = { trainingCount: 3, trainingDays: 2, totalDurationSeconds: 180, warmupCount: 1 }
const condition = {
  sessionType: 'CUSTOM',
  scenarioId: 7,
  scenarioVersion: 'v2',
  difficulty: 'low',
  aiPersonality: 'KIND',
  scriptLevel: 2,
}
const metricsComparison = metricKeys.map((key) => ({
  key,
  unit: metric(key).unit,
  deltaUnit:
    key === 'selfReportedAnxiety'
      ? 'POINT'
      : key === 'responseDelayMs'
        ? 'MILLISECOND'
        : 'PERCENTAGE_POINT',
  overall: { baseline: metric(key, 2), current: metric(key, 0), delta: -2, status: 'READY' },
  matched: {
    baseline: { ...metric(key, null), exclusionReasons: { NO_SHARED_CONDITION: 3 } },
    current: metric(key, null),
    delta: null,
    status: 'NOT_COMPARABLE',
    conditionCount: 0,
    conditions: [],
  },
}))
export const dashboardFixtureOverview = {
  meta: {
    period: { from: '2026-10-01', to: '2026-10-14', isPartial: false },
    baseline: { from: '2026-09-17', to: '2026-09-30' },
    interval: 'WEEK',
    filters: {},
    timeZone: 'Asia/Seoul',
  },
  summary,
  experience: { scenarioCount: 2, newScenarioCount: 1, unknownScenarioTrainingCount: 0 },
  hintSettings: { '1': 1, '2': 2, '3': 0, UNKNOWN: 0 },
  metrics: dashboardFixtureMetrics,
  series: [
    {
      from: '2026-10-01',
      to: '2026-10-07',
      isPartial: true,
      trainingCount: 3,
      metrics: dashboardFixtureMetrics,
    },
  ],
  activity: [
    { date: '2026-10-01', trainingCount: 3 },
    { date: '2026-10-02', trainingCount: 0 },
  ],
  coverage: { trainingCount: 3, selfReportCount: 3, metricSampleCounts: {} },
}

/** 대시보드의 실제 UI와 요청 파라미터를 검증하기 위한 서버 응답을 준비합니다. */
export const prepareDashboard = async (page: Page) => {
  const requests: URL[] = []
  const errors: string[] = []
  let overviewFailures = 0
  let isEmpty = false
  page.on('pageerror', (error) => errors.push(error.message))
  await page.route('**/api/v1/**', (route) => {
    const url = new URL(route.request().url())
    requests.push(url)
    const send = (data: unknown) => route.fulfill({ json: { data } })
    if (url.pathname.endsWith('/user/mypage'))
      return send({ username: 'bada', name: '바다', email: 'bada@example.test' })
    if (url.pathname.endsWith('/dashboard/overview')) {
      if (overviewFailures > 0) {
        overviewFailures--
        return route.fulfill({ status: 503, json: { message: '일시적인 오류' } })
      }
      return send(
        isEmpty
          ? {
              ...dashboardFixtureOverview,
              summary: { ...summary, trainingCount: 0 },
              metrics: Object.fromEntries(metricKeys.map((key) => [key, metric(key, null)])),
            }
          : dashboardFixtureOverview,
      )
    }
    if (url.pathname.endsWith('/dashboard/weekly-summary'))
      return send({ ...summary, totalCallDurationSeconds: 180 })
    if (url.pathname.endsWith('/dashboard/comparison'))
      return send({
        meta: dashboardFixtureOverview.meta,
        baselineSummary: summary,
        currentSummary: summary,
        metrics: metricsComparison,
        baselineConditions: [{ condition, trainingCount: 3 }],
        currentConditions: [{ condition, trainingCount: 3 }],
        baselineSeries: [],
        currentSeries: [],
      })
    if (url.pathname.endsWith('/dashboard/scenarios')) {
      const isDetail = url.searchParams.get('includeSeries') === 'true'
      return send({
        meta: dashboardFixtureOverview.meta,
        items: [
          {
            scenarioId: 7,
            sessionType: 'CUSTOM',
            scenarioName: '식당 예약',
            summary,
            firstTrainedAt: '2026-09-01T12:00:00',
            lastTrainedAt: '2026-10-01T12:00:00',
            conditionBreakdown: [{ condition, trainingCount: 3 }],
            metrics: dashboardFixtureMetrics,
            comparison: metricsComparison,
            series: isDetail ? dashboardFixtureOverview.series : [],
          },
        ],
        page: Number(url.searchParams.get('page') ?? 0),
        size: 5,
        totalElements: 6,
        totalPages: 2,
      })
    }
    if (url.pathname.endsWith('/training-records'))
      return send({
        content: isEmpty
          ? []
          : [
              {
                recordId: 42,
                sessionId: 's42',
                trainedAt: '2026-10-01T12:00:00',
                scenarioName: '식당 예약',
                sessionType: 'CUSTOM',
                durationSeconds: 60,
              },
            ],
        number: Number(url.searchParams.get('page') ?? 0),
        size: 5,
        totalElements: 6,
        totalPages: isEmpty ? 0 : url.searchParams.get('size') === '100' ? 1 : 2,
      })
    if (url.pathname.endsWith('/training-records/42'))
      return send({
        recordId: 42,
        sessionId: 's42',
        trainedAt: '2026-10-01T12:00:00',
        scenarioName: '식당 예약',
        sessionType: 'CUSTOM',
        durationSeconds: 60,
        scenarioId: 7,
        aiPersonality: 'KIND',
        transcript: [],
        positiveFeedbacks: [],
      })
    if (url.pathname.endsWith('/notifications/unread-count')) return send({ unreadCount: 0 })
    if (url.pathname.endsWith('/attendance')) return send([])
    if (url.pathname.includes('/scenario/recommendation'))
      return route.fulfill({
        json: {
          scenario: { scenario_id: 1, title: '식당 예약', content: '', is_custom: false },
          reason: 'NOT_PRACTICED',
        },
      })
    return send({})
  })
  await authenticate(page)
  return {
    requests,
    errors,
    failOverview: (count: number) => {
      overviewFailures = count
    },
    setEmpty: () => {
      isEmpty = true
    },
  }
}
