import type { Page } from '@playwright/test'
import type {
  DashboardMetricKey,
  DashboardMetricValues,
  DashboardOverview,
} from '../../src/entities/dashboard/index'
import { authenticate } from './authFixture'

const keys: DashboardMetricKey[] = [
  'selfReportedAnxiety',
  'tremorTurnRate',
  'longPauseTurnRate',
  'quietDropTurnRate',
  'fastRateTurnRate',
  'responseDelayMs',
]

/** 새 API의 여섯 지표와 원래 단위, 0, 결측값이 포함된 응답을 생성합니다. */
export const makeWeeklyOverview = (from = '2026-10-12', to = '2026-10-18'): DashboardOverview => {
  const values = [4, 0, null, 25, 10, 800]
  const metrics = Object.fromEntries(
    keys.map((key, index) => [
      key,
      {
        value: values[index],
        unit:
          key === 'selfReportedAnxiety'
            ? 'SCORE_0_10'
            : key === 'responseDelayMs'
              ? 'MILLISECOND'
              : 'PERCENT',
        aggregation: 'MEAN_OF_SESSION_RATES',
        sampleCount: values[index] === null ? 0 : 3,
        eligibleTurnCount: 9,
        status: values[index] === null ? 'NO_DATA' : 'READY',
        exclusionReasons: {},
      },
    ]),
  ) as DashboardMetricValues
  return {
    meta: {
      period: { from, to, isPartial: true },
      baseline: null,
      interval: 'DAY',
      filters: {
        sessionType: null,
        scenarioId: null,
        scenarioVersion: null,
        difficulty: null,
        aiPersonality: null,
        scriptLevel: null,
      },
      timeZone: 'Asia/Seoul',
      generatedAt: new Date().toISOString(),
      aggregationPolicyVersion: '1',
    },
    summary: { trainingCount: 7, trainingDays: 3, totalDurationSeconds: 180, warmupCount: 2 },
    experience: { scenarioCount: 4, newScenarioCount: 1, unknownScenarioTrainingCount: 0 },
    hintSettings: { '1': 7 },
    metrics,
    series: [{ from, to: from, isPartial: false, trainingCount: 7, metrics }],
    activity: [{ date: from, trainingCount: 7 }],
    coverage: {
      trainingCount: 7,
      selfReportCount: 3,
      metricSampleCounts: Object.fromEntries(keys.map((key) => [key, 3])) as Record<
        DashboardMetricKey,
        number
      >,
    },
  }
}

/** 실제 대시보드를 열어 개요 API와 기존 기록 링크를 검증할 서버 응답을 준비합니다. */
export const prepareWeeklyDashboard = async (page: Page) => {
  const overviewRequests: URL[] = []
  const legacyRequests: string[] = []
  const errors: string[] = []
  let failures = 0
  page.on('pageerror', (error) => errors.push(error.message))
  await page.route('**/api/v1/**', (route) => {
    const url = new URL(route.request().url())
    const path = url.pathname
    if (path.endsWith('/dashboard/overview')) {
      overviewRequests.push(url)
      if (failures > 0) {
        failures--
        return route.fulfill({ status: 503, json: { message: '조회 실패' } })
      }
      return route.fulfill({
        json: {
          data: makeWeeklyOverview(url.searchParams.get('from')!, url.searchParams.get('to')!),
        },
      })
    }
    if (path.endsWith('/dashboard/metrics') || path.endsWith('/dashboard/weekly-summary'))
      legacyRequests.push(path)
    if (path.endsWith('/attendance')) return route.fulfill({ json: { data: [] } })
    if (path.endsWith('/training-records'))
      return route.fulfill({ json: { data: { content: [], totalPages: 0, totalElements: 0 } } })
    if (path.endsWith('/scenario/recommendation'))
      return route.fulfill({
        json: {
          scenario: { scenario_id: 1, title: '식당 예약', content: '예약 연습', is_custom: false },
        },
      })
    return route.fulfill({ json: { data: {} } })
  })
  await authenticate(page)
  return {
    overviewRequests,
    legacyRequests,
    errors,
    failRequests: (count: number) => {
      failures = count
    },
  }
}
