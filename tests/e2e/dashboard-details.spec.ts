import { expect, test } from '@playwright/test'
import { prepareDashboardDetails } from './dashboardDetailsFixture'

// 패널을 열었을 때만 API를 호출하고 원래 카드 배치와 배경 스크롤을 유지합니다.
test('opens comparison on demand, displays API values, and restores focus after closing', async ({
  page,
}) => {
  const audit = await prepareDashboardDetails(page)
  await page.setViewportSize({ width: 1440, height: 1000 })
  await page.goto('/dashboard')
  await expect(page.getByText('이번 주 7회 훈련했어요')).toBeVisible()
  expect(audit.requests.filter((url) => url.pathname.includes('/dashboard/'))).toHaveLength(0)
  const trigger = page.getByRole('button', { name: '기간 비교', exact: true })
  await trigger.click()
  const panel = page.getByRole('dialog', { name: '기간 비교', exact: true })
  await expect(panel.getByText('-20%p', { exact: true }).first()).toBeVisible()
  await expect(panel.getByText(/이전 20\d{2}-\d{2}-\d{2} ~ 20\d{2}-\d{2}-\d{2}/)).toBeVisible()
  await expect(page.locator('[data-scroll-lock-target]')).toHaveCSS('overflow-y', 'hidden')
  await expect(page.getByRole('heading', { name: '주간 요약', exact: true })).toBeVisible()
  await page.screenshot({ path: 'test-results/dashboard-comparison-panel.png' })
  await page.keyboard.press('Escape')
  await expect(panel).toHaveCount(0)
  await expect(trigger).toBeFocused()
  await expect(page.locator('[data-scroll-lock-target]')).toHaveCSS('overflow-y', 'auto')
  expect(audit.errors).toEqual([])
})

test('applies filters, preserves unavailable matched comparisons, and opens a related record', async ({
  page,
}) => {
  const audit = await prepareDashboardDetails(page)
  await page.goto('/dashboard')
  await page.getByRole('button', { name: '기간 비교', exact: true }).click()
  const panel = page.getByRole('dialog', { name: '기간 비교', exact: true })
  const form = panel.getByRole('form', { name: '통계 상세 조회 조건' })
  await form.getByLabel('시작일').fill('2026-10-01')
  await form.getByLabel('종료일').fill('2026-10-14')
  await form.getByText('훈련 조건', { exact: true }).click()
  await form.getByLabel('훈련 유형').selectOption('CUSTOM')
  await form.getByLabel('힌트 단계').selectOption('2')
  await form.getByRole('button', { name: '적용하기' }).click()
  await expect
    .poll(() =>
      audit.requests.some(
        (url) =>
          url.pathname.endsWith('/dashboard/comparison') &&
          url.searchParams.get('from') === '2026-10-01' &&
          url.searchParams.get('scriptLevel') === '2' &&
          url.searchParams.get('sessionType') === 'CUSTOM',
      ),
    )
    .toBe(true)
  await panel.getByRole('button', { name: '동일 조건 비교', exact: true }).click()
  await expect(panel.getByText('동일 조건 비교 불가', { exact: true }).first()).toBeVisible()
  await expect(panel.getByText('-20%p', { exact: true })).toHaveCount(0)
  await panel.getByText('표본 수·제외 사유', { exact: true }).first().click()
  await expect(
    panel.getByText('제외: 공통 훈련 조건 없음 3건', { exact: true }).first(),
  ).toBeVisible()
  await panel.getByRole('button', { name: '이전 기간 기록', exact: true }).click()
  await expect
    .poll(() =>
      audit.requests.some(
        (url) =>
          url.pathname.endsWith('/training-records') &&
          url.searchParams.get('from') === '2026-09-17' &&
          url.searchParams.get('scriptLevel') === '2' &&
          !url.searchParams.has('interval'),
      ),
    )
    .toBe(true)
  const records = panel.getByRole('region', { name: '관련 훈련 기록' })
  await records
    .getByRole('navigation', { name: '관련 기록 페이지' })
    .getByRole('button', { name: '다음' })
    .click()
  await expect(records.getByText('2 / 2')).toBeVisible()
  await records.getByRole('button', { name: '선택 해제' }).click()
  await expect(records.getByText('1 / 2')).toBeVisible()
  await records.getByRole('link').click()
  await expect(page).toHaveURL(/\/records\?recordId=42&trainedAt=/)
  await expect(page.getByRole('dialog', { name: '훈련 기록 상세' })).toContainText('식당 예약')
  expect(audit.errors).toEqual([])
})

test('loads scenario pages and the selected scenario series, then filters related records', async ({
  page,
}) => {
  const audit = await prepareDashboardDetails(page)
  await page.goto('/dashboard')
  await page.getByRole('button', { name: '상황별 현황', exact: true }).click()
  const panel = page.getByRole('dialog', { name: '상황별 현황', exact: true })
  const pagination = panel.getByRole('navigation', { name: '상황 목록 페이지' })
  await pagination.getByRole('button', { name: '다음' }).click()
  await expect(pagination.getByText('2 / 2')).toBeVisible()
  await panel.getByRole('button', { name: /식당 예약.*직접 만든 상황/ }).click()
  await expect(panel.getByRole('heading', { name: '지표 추이' })).toBeVisible()
  await expect
    .poll(() =>
      audit.requests.some(
        (url) =>
          url.pathname.endsWith('/dashboard/scenarios') &&
          url.searchParams.get('includeSeries') === 'true' &&
          url.searchParams.get('scenarioId') === '7' &&
          url.searchParams.get('sessionType') === 'CUSTOM' &&
          url.searchParams.get('page') === '0',
      ),
    )
    .toBe(true)
  await panel.getByLabel('조회할 지표').selectOption('responseDelayMs')
  await page.screenshot({ path: 'test-results/dashboard-scenario-panel.png' })
  await panel
    .getByRole('button', { name: /부분 구간|관련 기록 →/ })
    .first()
    .click()
  await expect
    .poll(() =>
      audit.requests.some(
        (url) =>
          url.pathname.endsWith('/training-records') &&
          url.searchParams.get('scenarioId') === '7' &&
          url.searchParams.get('sessionType') === 'CUSTOM' &&
          url.searchParams.get('from') === url.searchParams.get('to'),
      ),
    )
    .toBe(true)
  await panel.getByText('훈련 조건별 분포', { exact: true }).click()
  await panel.getByRole('button', { name: /직접 만든 상황 · 상황 #7 · 버전 v2/ }).click()
  await expect
    .poll(() =>
      audit.requests.some(
        (url) =>
          url.pathname.endsWith('/training-records') &&
          url.searchParams.get('scenarioVersion') === 'v2' &&
          url.searchParams.get('aiPersonality') === 'KIND' &&
          url.searchParams.get('scriptLevel') === '2',
      ),
    )
    .toBe(true)
  await panel.getByRole('button', { name: '← 상황 목록' }).click()
  await expect(pagination).toBeVisible()
  expect(audit.errors).toEqual([])
})

test('rejects invalid periods and recovers from failed requests and empty results on mobile', async ({
  page,
}) => {
  const audit = await prepareDashboardDetails(page)
  audit.failComparison(2)
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto('/dashboard')
  await page.getByRole('button', { name: '기간 비교', exact: true }).click()
  const panel = page.getByRole('dialog', { name: '기간 비교', exact: true })
  await expect(panel.getByText('기간 비교를 불러오지 못했어요')).toBeVisible()
  await panel.getByRole('button', { name: '다시 불러오기' }).click()
  await expect(panel.getByText('-20%p', { exact: true }).first()).toBeVisible()
  const form = panel.getByRole('form', { name: '통계 상세 조회 조건' })
  await form.getByLabel('시작일').fill('2024-01-01')
  await form.getByLabel('종료일').fill('2025-01-01')
  const count = audit.requests.filter((url) =>
    url.pathname.endsWith('/dashboard/comparison'),
  ).length
  await form.getByRole('button', { name: '적용하기' }).click()
  await expect(panel.getByRole('alert')).toContainText('366일')
  expect(
    audit.requests.filter((url) => url.pathname.endsWith('/dashboard/comparison')),
  ).toHaveLength(count)
  expect(await panel.evaluate((element) => element.scrollWidth <= element.clientWidth)).toBe(true)
  expect(
    await panel.evaluate((element) => {
      const bounds = element.getBoundingClientRect()
      return element.contains(
        document.elementFromPoint(bounds.left + bounds.width / 2, bounds.bottom - 20),
      )
    }),
  ).toBe(true)
  audit.setEmpty()
  await panel.getByRole('button', { name: '상황별 현황', exact: true }).click()
  const scenarios = page.getByRole('dialog', { name: '상황별 현황', exact: true })
  await expect(scenarios.getByText('선택한 조건에서 연습한 상황이 없어요')).toBeVisible()
  await page.screenshot({ path: 'test-results/dashboard-details-mobile.png' })
  await scenarios.getByRole('button', { name: '통계 상세 닫기', exact: true }).click()
  await expect(scenarios).toHaveCount(0)
  expect(audit.errors).toEqual([])
})
