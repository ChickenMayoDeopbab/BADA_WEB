import { expect, test } from '@playwright/test'
import { prepareWeeklyDashboard } from './weeklyDashboardFixture'

// 개요 API가 호출되었다는 사실과 그 응답이 원래 화면에 보인다는 사실을 함께 확인합니다.
test('connects six metrics, summary and header to one overview request within the existing layout', async ({
  page,
}) => {
  const audit = await prepareWeeklyDashboard(page)
  await page.goto('/dashboard')
  await expect(page.getByText('이번 주 7회 훈련했어요')).toBeVisible()
  await expect(page.getByText('7회 훈련 · 총 3분 0초')).toBeVisible()
  await expect(page.getByText('3일 동안 4개 상황을 연습했어요.', { exact: false })).toBeVisible()
  const legend = page.getByRole('list', { name: '주간 지표 평균' })
  await expect(legend.getByRole('listitem')).toHaveCount(6)
  await expect(legend).toContainText('불안 4점')
  await expect(legend).toContainText('떨림 0%')
  await expect(legend).toContainText('긴 멈춤 — (미측정)')
  await expect(legend).toContainText('응답 시간 800ms')
  const chart = page.getByRole('list', { name: '요일별 훈련 지표' })
  await expect(chart.getByRole('listitem')).toHaveCount(7)
  await expect(chart.getByRole('img')).toHaveCount(42)
  await expect(chart.getByRole('img', { name: /떨림 0%/ })).toHaveCSS('height', '0px')
  expect(audit.overviewRequests).toHaveLength(1)
  expect(audit.overviewRequests[0].searchParams.get('interval')).toBe('DAY')
  expect(audit.legacyRequests).toEqual([])
  await expect(page.getByRole('heading', { name: '최근 훈련 기록' })).toBeVisible()
  await expect(page.getByRole('heading', { name: '훈련 통계', exact: true })).toHaveCount(0)
  await page.getByRole('heading', { name: '주간 지표' }).scrollIntoViewIfNeeded()
  await page.screenshot({ path: 'test-results/weekly-dashboard-desktop.png' })
  expect(audit.errors).toEqual([])
})

test('keeps the seven-day chart and original panels within mobile width', async ({ page }) => {
  const audit = await prepareWeeklyDashboard(page)
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto('/dashboard')
  await expect(page.getByText('7회 훈련 · 총 3분 0초')).toBeVisible()
  await page.getByRole('heading', { name: '주간 지표' }).scrollIntoViewIfNeeded()
  const chart = page.getByRole('list', { name: '요일별 훈련 지표' })
  expect(await chart.evaluate((element) => element.scrollWidth <= element.clientWidth)).toBe(true)
  expect(
    await page.getByRole('main').evaluate((element) => element.scrollWidth <= element.clientWidth),
  ).toBe(true)
  const legend = page.getByRole('list', { name: '주간 지표 평균' })
  await legend.evaluate((element) => {
    element.scrollLeft = element.scrollWidth
  })
  await expect(legend.getByText('응답 시간 800ms')).toBeVisible()
  await page.screenshot({ path: 'test-results/weekly-dashboard-mobile.png' })
  expect(audit.errors).toEqual([])
})

test('retries failed overview requests and fills the original panels after recovery', async ({
  page,
}) => {
  const audit = await prepareWeeklyDashboard(page)
  audit.failRequests(2)
  await page.goto('/dashboard')
  await expect(page.getByText('주간 지표를 불러오지 못했어요').first()).toBeVisible()
  await page.getByRole('button', { name: '다시 불러오기' }).first().click()
  await expect(page.getByText('이번 주 7회 훈련했어요')).toBeVisible()
  await expect(page.getByRole('list', { name: '주간 지표 평균' })).toContainText('응답 시간 800ms')
  expect(audit.errors).toEqual([])
})
