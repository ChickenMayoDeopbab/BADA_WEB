import { expect, test } from '@playwright/test'
import { prepareDashboardDetails } from './dashboardDetailsFixture'

// 패널을 열었을 때만 API를 호출하고 원래 카드 배치와 배경 스크롤을 유지합니다.
test('opens comparison on demand, displays API values, and restores focus after closing', async ({
  page,
}) => {
  const audit = await prepareDashboardDetails(page)
  await page.setViewportSize({ width: 1440, height: 1000 })
  await page.clock.setFixedTime(new Date('2026-10-18T03:00:00Z'))
  await page.goto('/dashboard')
  await expect(page.getByText('이번 주 7회 훈련했어요')).toBeVisible()
  expect(audit.requests.filter((url) => url.pathname.includes('/dashboard/'))).toHaveLength(0)
  const trigger = page.getByRole('button', { name: '기간 비교', exact: true })
  await trigger.click()
  const panel = page.getByRole('dialog', { name: '기간 비교', exact: true })
  await expect(panel.getByText('이전보다 2점 낮아졌어요', { exact: true })).toBeVisible()
  const metrics = panel.getByRole('group', { name: '지표 선택' })
  await expect(metrics.getByRole('button')).toHaveCount(6)
  const tabBounds = await metrics
    .getByRole('button')
    .evaluateAll((elements) => elements.map((element) => element.getBoundingClientRect().top))
  expect(new Set(tabBounds).size).toBe(1)
  await metrics.getByRole('button', { name: '떨림', exact: true }).click()
  await expect(panel.getByRole('region', { name: '불안 비교', exact: true })).toHaveCount(0)
  const comparison = panel.getByRole('region', { name: '떨림 비교', exact: true })
  await expect(comparison.getByText('0%', { exact: true })).toBeVisible()
  await expect(comparison.getByText('이전보다 20%p 낮아졌어요', { exact: true })).toBeVisible()
  await expect(comparison.getByText('10.05 ~ 10.11', { exact: true })).toBeVisible()
  await expect(panel.getByText('훈련 조건별 분포', { exact: true })).toHaveCount(0)
  await expect(panel.getByText('기간별 훈련 횟수', { exact: true })).toHaveCount(0)
  expect(
    audit.requests.filter((url) => url.pathname.endsWith('/dashboard/comparison')),
  ).toHaveLength(1)
  const records = panel.getByRole('region', { name: '관련 훈련 기록' })
  await expect(records.getByRole('link').locator('img').first()).toHaveAttribute(
    'src',
    '/__e2e/food-icon.svg',
  )
  await expect(records.getByRole('link')).toContainText('1분 0초')
  await expect(records.getByText(/2026-/)).toHaveCount(0)
  await expect(records.getByText('기록 보기')).toHaveCount(0)
  await expect(page.locator('[data-scroll-lock-target]')).toHaveCSS('overflow-y', 'hidden')
  await expect(page.getByRole('heading', { name: '주간 요약', exact: true })).toBeVisible()
  await expect(panel).toHaveCSS('animation-name', 'record-detail-enter')
  const backBounds = await panel
    .getByRole('button', { name: '통계 상세 닫기', exact: true })
    .boundingBox()
  const titleBounds = await panel
    .getByRole('heading', { name: '기간 비교', exact: true })
    .boundingBox()
  expect(backBounds!.x).toBeLessThan(titleBounds!.x)
  await page.screenshot({
    path: 'test-results/dashboard-comparison-panel.png',
    animations: 'disabled',
  })
  await page.keyboard.press('Escape')
  await expect(panel).toHaveCount(0)
  await expect(page.locator('aside[aria-labelledby="dashboard-details-title"]')).toHaveCount(0)
  await expect(trigger).toBeFocused()
  await expect(page.locator('[data-scroll-lock-target]')).toHaveCSS('overflow-y', 'auto')
  expect(audit.errors).toEqual([])
})

test('applies filters, preserves unavailable matched comparisons, and opens a related record', async ({
  page,
}) => {
  const audit = await prepareDashboardDetails(page)
  await page.clock.setFixedTime(new Date('2026-10-18T03:00:00Z'))
  await page.goto('/dashboard')
  await page.getByRole('button', { name: '기간 비교', exact: true }).click()
  const panel = page.getByRole('dialog', { name: '기간 비교', exact: true })
  const form = panel.getByRole('form', { name: '통계 상세 조회 조건' })
  await form.getByRole('button', { name: /^시작일/ }).click()
  const calendar = page.getByRole('dialog', { name: '통계 날짜 범위 선택' })
  await calendar.getByRole('button', { name: '2026년 10월 1일', exact: true }).click()
  await calendar.getByRole('button', { name: '2026년 10월 14일', exact: true }).click()
  await expect(
    calendar.getByRole('button', { name: '2026년 10월 7일', exact: true }),
  ).toHaveAttribute('aria-pressed', 'true')
  await calendar.getByRole('button', { name: '적용', exact: true }).click()
  await expect(form.getByRole('button', { name: /^시작일/ })).toContainText('2026.10.01')
  await expect(form.getByRole('button', { name: /^종료일/ })).toContainText('2026.10.14')
  expect(
    audit.requests.filter((url) => url.pathname.endsWith('/dashboard/comparison')),
  ).toHaveLength(1)
  await form.getByRole('button', { name: '훈련 골라보기', exact: true }).click()
  const filters = page.getByRole('dialog', { name: '훈련 골라보기', exact: true })
  await filters.getByLabel('시나리오 종류').selectOption('CUSTOM')
  await filters.getByLabel('힌트 단계').selectOption('2')
  await page.screenshot({
    path: 'test-results/dashboard-filter-dialog.png',
    animations: 'disabled',
  })
  await filters.getByRole('button', { name: '적용', exact: true }).click()
  await expect(filters).toHaveCount(0)
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
  await panel.getByRole('button', { name: '비교 방식 · 모든 훈련', exact: true }).click()
  await panel.getByRole('checkbox', { name: '같은 상황과 설정으로 한 훈련만 비교' }).check()
  await expect(
    panel.getByText('두 기간의 기록을 같은 기준으로 비교할 수 없어요.', { exact: true }),
  ).toBeVisible()
  await expect(panel.getByText(/이전보다/)).toHaveCount(0)
  await panel.getByRole('button', { name: '평균을 어떻게 계산하나요?', exact: true }).click()
  await expect(
    panel
      .getByText('계산에서 빠진 이유: 두 기간에 같은 상황과 설정의 훈련 없음 3건', { exact: true })
      .first(),
  ).toBeVisible()
  await panel.getByRole('button', { name: '훈련량 함께 보기', exact: true }).click()
  await panel.getByRole('button', { name: /^이전 기간 기록/ }).click()
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
  await expect(records.getByRole('link').locator('svg')).toBeVisible()
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
  await page.clock.setFixedTime(new Date('2026-10-18T03:00:00Z'))
  await page.goto('/dashboard')
  await page.getByRole('button', { name: '상황별 현황', exact: true }).click()
  const panel = page.getByRole('dialog', { name: '상황별 현황', exact: true })
  const pagination = panel.getByRole('navigation', { name: '상황 목록 페이지' })
  await pagination.getByRole('button', { name: '다음' }).click()
  await expect(pagination.getByText('2 / 2')).toBeVisible()
  await panel.getByRole('button', { name: /식당 예약.*직접 만든 상황/ }).click()
  await expect(panel.getByRole('region', { name: '불안 비교' })).toBeVisible()
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
  await panel
    .getByRole('group', { name: '지표 선택' })
    .getByRole('button', { name: '응답 시간', exact: true })
    .click()
  await expect(panel.getByRole('region', { name: '응답 시간 비교' })).toBeVisible()
  await page.screenshot({
    path: 'test-results/dashboard-scenario-panel.png',
    animations: 'disabled',
  })
  await panel.getByRole('button', { name: '날짜별 변화', exact: true }).click()
  await panel
    .getByRole('button', { name: /^10\..*훈련 기록$/ })
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
  await panel.getByRole('button', { name: '연습한 설정별 기록', exact: true }).click()
  await panel.getByRole('button', { name: /쉬움 · 친절함 · 힌트 2단계/ }).click()
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

test('cancels calendar edits and recovers from failed requests and empty results on mobile', async ({
  page,
}) => {
  const audit = await prepareDashboardDetails(page)
  audit.failComparison(2)
  await page.setViewportSize({ width: 390, height: 844 })
  await page.clock.setFixedTime(new Date('2026-10-18T03:00:00Z'))
  await page.goto('/dashboard')
  await page.getByRole('button', { name: '기간 비교', exact: true }).click()
  const panel = page.getByRole('dialog', { name: '기간 비교', exact: true })
  await expect(panel.getByText('기간 비교를 불러오지 못했어요')).toBeVisible()
  await panel.getByRole('button', { name: '다시 불러오기' }).click()
  await expect(panel.getByText('이전보다 2점 낮아졌어요', { exact: true })).toBeVisible()
  await panel
    .getByRole('group', { name: '지표 선택' })
    .getByRole('button', { name: '응답 시간', exact: true })
    .click()
  await expect(panel.getByRole('region', { name: '응답 시간 비교' })).toContainText('800ms')
  const metricButtons = panel.getByRole('group', { name: '지표 선택' }).getByRole('button')
  const metricGeometry = await metricButtons.evaluateAll((buttons) =>
    buttons.map((button) => ({
      top: button.getBoundingClientRect().top,
      fits: button.scrollWidth <= button.clientWidth,
    })),
  )
  expect(new Set(metricGeometry.map(({ top }) => top)).size).toBe(1)
  expect(metricGeometry.every(({ fits }) => fits)).toBe(true)
  await page.screenshot({
    path: 'test-results/dashboard-comparison-mobile.png',
    animations: 'disabled',
  })
  const form = panel.getByRole('form', { name: '통계 상세 조회 조건' })
  const startDate = form.getByRole('button', { name: /^시작일/ })
  const initialDate = await startDate.textContent()
  const count = audit.requests.filter((url) =>
    url.pathname.endsWith('/dashboard/comparison'),
  ).length
  await startDate.click()
  const calendar = page.getByRole('dialog', { name: '통계 날짜 범위 선택' })
  await expect(calendar.getByRole('button', { name: '다음 달' })).toBeDisabled()
  await expect(
    calendar.getByRole('button', { name: '2026년 10월 19일', exact: true }),
  ).toBeDisabled()
  await calendar.getByRole('button', { name: '2026년 10월 1일', exact: true }).click()
  await page.screenshot({
    path: 'test-results/dashboard-calendar-mobile.png',
    animations: 'disabled',
  })
  expect(await calendar.evaluate((element) => element.scrollWidth <= element.clientWidth)).toBe(
    true,
  )
  await page.keyboard.press('Escape')
  await expect(calendar).toHaveCount(0)
  await expect(panel).toBeVisible()
  await expect(startDate).toBeFocused()
  await expect(startDate).toHaveText(initialDate!)
  await expect(page.locator('[data-scroll-lock-target]')).toHaveCSS('overflow-y', 'hidden')
  await startDate.click()
  await calendar.getByRole('button', { name: '이전 달' }).click()
  await expect(calendar.getByRole('heading', { name: '2026년 9월' })).toBeVisible()
  await calendar.getByRole('button', { name: '취소', exact: true }).click()
  await expect(startDate).toHaveText(initialDate!)
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

// 줄인 모션 환경에서도 패널을 정리하고 다시 열 수 있어야 합니다.
test('respects reduced motion and reopens the drawer after closing', async ({ page }) => {
  await prepareDashboardDetails(page)
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.goto('/dashboard')
  const trigger = page.getByRole('button', { name: '기간 비교', exact: true })
  await trigger.click()
  const panel = page.getByRole('dialog', { name: '기간 비교', exact: true })
  await expect(panel).toHaveCSS('animation-name', 'none')
  await panel.getByRole('button', { name: '통계 상세 닫기', exact: true }).click()
  await expect(page.locator('aside[aria-labelledby="dashboard-details-title"]')).toHaveCount(0)
  await expect(trigger).toBeFocused()
  await trigger.click()
  await expect(panel).toBeVisible()
  await expect(page.locator('[data-scroll-lock-target]')).toHaveCSS('overflow-y', 'hidden')
})

// 검색 취소·초점 복원과 펼침 애니메이션, 기록 행 배치를 검증합니다.
test('cancels filter edits, animates disclosures, and spaces record rows', async ({ page }) => {
  const audit = await prepareDashboardDetails(page)
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto('/dashboard')
  await page.getByRole('button', { name: '기간 비교', exact: true }).click()
  const panel = page.getByRole('dialog', { name: '기간 비교', exact: true })
  await expect(panel.getByText('이전보다 2점 낮아졌어요')).toBeVisible()
  const trigger = panel.getByRole('button', { name: '훈련 골라보기', exact: true })
  await trigger.click()
  const filters = page.getByRole('dialog', { name: '훈련 골라보기', exact: true })
  await filters.getByLabel('난이도').selectOption('high')
  await filters.getByLabel('난이도').focus()
  await expect(filters.getByLabel('난이도')).not.toHaveCSS('outline-color', 'rgb(10, 227, 101)')
  await page.screenshot({
    path: 'test-results/dashboard-filter-mobile.png',
    animations: 'disabled',
  })
  await page.keyboard.press('Escape')
  await expect(filters).toHaveCount(0)
  await expect(panel).toBeVisible()
  await expect(trigger).toBeFocused()
  await expect(page.locator('[data-scroll-lock-target]')).toHaveCSS('overflow-y', 'hidden')
  await trigger.click()
  await expect(filters.getByLabel('난이도')).toHaveValue('')
  await filters.getByRole('button', { name: '취소', exact: true }).click()
  expect(
    audit.requests.filter((url) => url.pathname.endsWith('/dashboard/comparison')),
  ).toHaveLength(1)

  const disclosure = panel.getByRole('button', { name: '훈련량 함께 보기', exact: true })
  const body = page.locator(`[id="${await disclosure.getAttribute('aria-controls')}"]`)
  await expect(disclosure).toHaveAttribute('aria-expanded', 'false')
  await expect(body).toHaveCSS('height', '0px')
  await disclosure.click()
  await expect(disclosure).toHaveAttribute('aria-expanded', 'true')
  await expect(body).toHaveCSS('transition-property', 'grid-template-rows, opacity')
  await expect(body).toHaveCSS('transition-duration', '0.4s')
  await expect(body.getByRole('button', { name: /^이전 기간 기록/ })).toBeVisible()
  await disclosure.click()
  await expect(body).toHaveCSS('height', '0px')
  await expect(body).toHaveAttribute('inert', '')

  const records = panel.getByRole('region', { name: '관련 훈련 기록' })
  const row = records.getByRole('link')
  await row.scrollIntoViewIfNeeded()
  const title = await row.getByText('식당 예약', { exact: true }).boundingBox()
  const time = await row.getByText('1분 0초', { exact: true }).boundingBox()
  expect(time!.y).toBeGreaterThanOrEqual(title!.y + title!.height)
  const leftPadding = await row.evaluate((element) => getComputedStyle(element).paddingLeft)
  expect(leftPadding).toBe('12px')
  const before = await row.evaluate((element) => getComputedStyle(element).backgroundColor)
  await row.hover()
  await expect
    .poll(() => row.evaluate((element) => getComputedStyle(element).backgroundColor))
    .not.toBe(before)
  await page.screenshot({
    path: 'test-results/dashboard-record-row-mobile.png',
    animations: 'disabled',
  })
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await expect(body).toHaveCSS('transition-duration', '0s')
  expect(audit.errors).toEqual([])
})
