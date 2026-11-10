import { expect, test, type Page, type Route } from '@playwright/test'
import { authenticate } from './authFixture'
import { makeBiosignalReport, makeWatch6BiosignalReport } from './biosignalReportFixture'

const trainedAt = '2026-11-10T09:20:00+09:00'
const record = {
  recordId: 1,
  sessionId: 'session-bio-1',
  trainedAt,
  scenarioId: 3,
  scenarioName: '병원 예약 변경하기',
  sessionType: 'SCENARIO',
  aiPersonality: 'NORMAL',
  durationSeconds: 150,
  anxietyScore: 4,
  positiveFeedbacks: [
    {
      startSecond: 42,
      endSecond: 50,
      good_point: '바꾸고 싶은 날짜를 또렷하게 말했어요.',
      summary: '원하는 내용을 먼저 말해서 상대가 바로 이해했어요.',
    },
  ],
}

/** 훈련 기록 API와 AI 서버의 생체신호 조회를 예시 응답으로 대신합니다. */
const prepare = async (page: Page, biosignal: (route: Route) => unknown) => {
  await authenticate(page)
  await page.route('**/api/v1/**', (route) => {
    const path = new URL(route.request().url()).pathname
    if (path.endsWith('/training-records/1')) return route.fulfill({ json: { data: record } })
    if (path.endsWith('/training-records'))
      return route.fulfill({
        json: { data: { content: [record], totalElements: 1, totalPages: 1 } },
      })
    if (path.endsWith('/user/mypage'))
      return route.fulfill({ json: { data: { username: 'bada-test', name: '테스트 사용자' } } })
    return route.fulfill({ json: { data: {} } })
  })
  await page.route('**/api/v1/biosignals/**', (route) => biosignal(route))
}

const openRecord = (page: Page) =>
  page.goto(`/records?recordId=1&trainedAt=${encodeURIComponent(trainedAt)}`)

test('훈련 기록 상세에 몸의 반응 카드를 보여 준다', async ({ page }) => {
  let requestedPath = ''
  await prepare(page, (route) => {
    requestedPath = new URL(route.request().url()).pathname
    return route.fulfill({ json: makeBiosignalReport('session-bio-1') })
  })
  // 카드 전체가 상세 패널 스크롤 영역 안에 들어오도록 높게 잡고, 펼침 전환은 끕니다.
  await page.setViewportSize({ width: 1280, height: 1900 })
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await openRecord(page)

  const dialog = page.getByRole('dialog', { name: '훈련 기록 상세' })
  await expect(dialog.getByRole('heading', { name: '몸의 반응' })).toBeVisible()
  expect(requestedPath).toMatch(/\/api\/v1\/biosignals\/session-bio-1$/)
  await expect(dialog.getByText('통화하는 동안 심박이 평소보다 조금 빨랐어요.')).toBeVisible()
  await expect(
    dialog.getByRole('img', { name: '통화 전부터 끊은 뒤까지의 심박 흐름 그래프' }),
  ).toBeVisible()
  await expect(dialog.getByText('0:47 · 내가 말할 때')).toBeVisible()
  await expect(dialog.getByText('평소 쪽으로 72% 돌아왔어요')).toBeVisible()
  await expect(dialog.getByRole('heading', { name: '피부전도' })).toBeVisible()
  await expect(dialog.getByText('+23%')).toBeVisible()
  await expect(dialog.getByRole('heading', { name: '손목 피부 온도' })).toBeVisible()
  await expect(dialog.getByText('33.1°C')).toBeVisible()
  const numberToggle = dialog.getByRole('button', { name: '심박 숫자' })
  await expect(numberToggle).toHaveAttribute('aria-expanded', 'false')

  await numberToggle.click()
  await expect(dialog.getByText('72 bpm')).toBeVisible()
  await expect(dialog.getByText('94 bpm')).toBeVisible()

  const card = dialog.getByRole('heading', { name: '몸의 반응' }).locator('..')
  await card.scrollIntoViewIfNeeded()
  await card.screenshot({ path: 'test-results/biosignal-report-card.png' })
  await page.screenshot({ path: 'test-results/biosignal-report-panel.png' })

  // 작은 화면에서도 가로로 넘치지 않는지 확인합니다.
  await page.setViewportSize({ width: 390, height: 1900 })
  const overflow = await card.evaluate((element) => element.scrollWidth - element.clientWidth)
  expect(overflow).toBeLessThanOrEqual(0)
  await card.screenshot({ path: 'test-results/biosignal-report-card-mobile.png' })
})

test('피부전도 센서가 없는 워치는 그 구역만 숨긴다', async ({ page }) => {
  await prepare(page, (route) =>
    route.fulfill({ json: makeWatch6BiosignalReport('session-bio-1') }),
  )
  await page.setViewportSize({ width: 1280, height: 1100 })
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await openRecord(page)

  const dialog = page.getByRole('dialog', { name: '훈련 기록 상세' })
  await expect(dialog.getByRole('heading', { name: '몸의 반응' })).toBeVisible()
  await expect(dialog.getByRole('heading', { name: '피부전도' })).toHaveCount(0)
  await expect(dialog.getByRole('heading', { name: '손목 피부 온도' })).toHaveCount(0)

  const card = dialog.getByRole('heading', { name: '몸의 반응' }).locator('..')
  await card.scrollIntoViewIfNeeded()
  await card.screenshot({ path: 'test-results/biosignal-report-card-watch6.png' })
})

test('측정하지 않은 통화(404)는 다시 묻지 않고 구역을 숨긴다', async ({ page }) => {
  let requestCount = 0
  await prepare(page, (route) => {
    requestCount += 1
    return route.fulfill({ status: 404, json: { detail: 'NOT_FOUND' } })
  })
  await openRecord(page)

  const dialog = page.getByRole('dialog', { name: '훈련 기록 상세' })
  await expect(dialog.getByText('바꾸고 싶은 날짜를 또렷하게 말했어요.')).toBeVisible()
  await expect.poll(() => requestCount).toBe(1)
  await page.waitForTimeout(500)
  expect(requestCount).toBe(1)
  await expect(dialog.getByRole('heading', { name: '몸의 반응' })).toHaveCount(0)
})
