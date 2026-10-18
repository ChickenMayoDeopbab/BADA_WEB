import { expect, test } from '@playwright/test'
import { prepareDashboard } from './dashboardFixture'

// 기간과 조건을 실제 화면에서 적용하여 세 통계 API 및 기록 검색을 검증합니다.
test('filters statistics, distinguishes zero from missing data, and opens a related record detail', async ({
  page,
}) => {
  const audit = await prepareDashboard(page)
  await page.goto('/dashboard')
  const dashboard = page.getByRole('region', { name: '훈련 통계', exact: true })
  await expect(dashboard.getByRole('heading', { name: '지표 평균' })).toBeVisible()
  await expect(dashboard.getByText('0%', { exact: true }).first()).toBeVisible()
  await expect(dashboard.getByText('—', { exact: true }).first()).toBeVisible()
  const filters = page.getByRole('form', { name: '훈련 통계 조회 조건' })
  await filters.getByLabel('시작일', { exact: true }).fill('2026-10-01')
  await filters.getByLabel('종료일', { exact: true }).fill('2026-10-14')
  await filters.getByLabel('추이 단위').selectOption('DAY')
  await filters.getByLabel('훈련 유형').selectOption('CUSTOM')
  await filters.getByText('훈련 조건 상세').click()
  await filters.getByLabel('힌트 단계').selectOption('2')
  await filters.getByRole('button', { name: '조회하기' }).click()
  await expect
    .poll(() =>
      audit.requests.some(
        (url) =>
          url.pathname.endsWith('/dashboard/overview') &&
          url.searchParams.get('from') === '2026-10-01' &&
          url.searchParams.get('interval') === 'DAY' &&
          url.searchParams.get('scriptLevel') === '2',
      ),
    )
    .toBe(true)
  await dashboard.getByRole('button', { name: '10-01 3회' }).click()
  await expect
    .poll(() =>
      audit.requests.some(
        (url) =>
          url.pathname.endsWith('/training-records') &&
          url.searchParams.get('from') === '2026-10-01' &&
          url.searchParams.get('to') === '2026-10-01' &&
          url.searchParams.get('sessionType') === 'CUSTOM' &&
          url.searchParams.get('scriptLevel') === '2' &&
          !url.searchParams.has('interval'),
      ),
    )
    .toBe(true)
  const records = dashboard.getByRole('region', { name: '관련 훈련 기록' })
  await records
    .getByRole('navigation', { name: '관련 기록 페이지' })
    .getByRole('button', { name: '다음' })
    .click()
  await expect(records.getByText('2 / 2')).toBeVisible()
  await records.getByRole('button', { name: '선택 해제' }).click()
  await expect(records.getByText('1 / 2')).toBeVisible()
  await dashboard.getByRole('heading', { name: '훈련 통계', exact: true }).scrollIntoViewIfNeeded()
  await page.screenshot({ path: 'test-results/dashboard-desktop.png' })
  await dashboard.getByRole('heading', { name: '지표 평균' }).scrollIntoViewIfNeeded()
  await page.screenshot({ path: 'test-results/dashboard-metrics.png' })
  await records.getByRole('link').click()
  await expect(page).toHaveURL(/\/records\?recordId=42&trainedAt=/)
  await expect(page.getByRole('dialog', { name: '훈련 기록 상세' })).toContainText('식당 예약')
  expect(audit.errors).toEqual([])
})

test('compares periods and keeps unsupported matched comparisons unavailable', async ({ page }) => {
  const audit = await prepareDashboard(page)
  await page.goto('/dashboard')
  await page.getByRole('button', { name: '기간 비교', exact: true }).click()
  await expect(page.getByText('-2%p', { exact: true }).first()).toBeVisible()
  await page.getByRole('button', { name: '동일 조건 비교', exact: true }).click()
  await expect(page.getByText('동일 조건 비교 불가 · 공통 조건 0개').first()).toBeVisible()
  await expect(page.getByText('-2%p', { exact: true })).toHaveCount(0)
  await page.getByText('표본 수·제외 사유', { exact: true }).first().click()
  await expect(
    page.getByText('제외: 공통 훈련 조건 없음 3건', { exact: true }).first(),
  ).toBeVisible()
  await page.getByText('기간별 훈련 조건 분포').click()
  await page
    .getByRole('button', { name: /직접 만든 상황 · 상황 #7/ })
    .first()
    .click()
  await expect
    .poll(() =>
      audit.requests.some(
        (url) =>
          url.pathname.endsWith('/training-records') &&
          url.searchParams.get('from') === '2026-09-17' &&
          url.searchParams.get('scenarioVersion') === 'v2',
      ),
    )
    .toBe(true)
  expect(audit.errors).toEqual([])
})

test('paginates scenarios and loads the selected scenario series with its session type', async ({
  page,
}) => {
  const audit = await prepareDashboard(page)
  await page.goto('/dashboard')
  await page.getByRole('button', { name: '상황별 현황', exact: true }).click()
  const pagination = page.getByRole('navigation', { name: '상황 목록 페이지' })
  await pagination.getByRole('button', { name: '다음' }).click()
  await expect(pagination.getByText('2 / 2')).toBeVisible()
  await page.getByRole('button', { name: /식당 예약.*직접 만든 상황/ }).click()
  await expect(page.getByRole('heading', { name: '식당 예약 상세' })).toBeVisible()
  await expect
    .poll(() =>
      audit.requests.some(
        (url) =>
          url.pathname.endsWith('/dashboard/scenarios') &&
          url.searchParams.get('scenarioId') === '7' &&
          url.searchParams.get('sessionType') === 'CUSTOM' &&
          url.searchParams.get('includeSeries') === 'true' &&
          url.searchParams.get('page') === '0',
      ),
    )
    .toBe(true)
  await page.getByRole('button', { name: '2026-10-01 ~ 2026-10-07 (부분 구간)' }).click()
  await expect
    .poll(() =>
      audit.requests.some(
        (url) =>
          url.pathname.endsWith('/training-records') &&
          url.searchParams.get('scenarioId') === '7' &&
          url.searchParams.get('from') === '2026-10-01',
      ),
    )
    .toBe(true)
  expect(audit.errors).toEqual([])
})

test('shows retry and empty states, and fits the dashboard into a mobile viewport', async ({
  page,
}) => {
  const audit = await prepareDashboard(page)
  audit.failOverview(2)
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto('/dashboard')
  await expect(page.getByText('훈련 통계를 불러오지 못했어요')).toBeVisible({ timeout: 20000 })
  audit.setEmpty()
  await page.getByRole('button', { name: '다시 불러오기' }).click()
  await expect(page.getByText('선택한 기간과 조건의 훈련이 없어요')).toBeVisible()
  await page.getByRole('button', { name: '10-02 0회' }).click()
  await expect(page.getByText('선택한 조건의 관련 기록이 없어요')).toBeVisible()
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(
    true,
  )
  await page.getByRole('heading', { name: '훈련 통계', exact: true }).scrollIntoViewIfNeeded()
  await page.screenshot({ path: 'test-results/dashboard-mobile.png' })
  expect(audit.errors).toEqual([])
})
