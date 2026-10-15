import { expect, test } from '@playwright/test'
import { authenticate } from './authFixture'

test('renders the landing page', async ({ page }) => {
  await page.goto('/')

  await expect(page.getByRole('heading', { name: '랜딩 페이지' })).toBeVisible()
  await expect(page.getByRole('link', { name: /대시보드/ })).toHaveCount(0)
  await expect
    .poll(() => page.evaluate(() => document.fonts.check('16px "Pretendard Variable"')))
    .toBe(true)
})

test('renders a service route with an authenticated session', async ({ page }) => {
  await authenticate(page)
  await page.route('**/api/v1/**', (route) => route.abort())
  await page.route('**/api/v1/user/mypage', (route) =>
    route.fulfill({
      json: { data: { username: 'bada-test', name: '바다', email: 'bada@example.test' } },
    }),
  )
  await page.goto('/dashboard')

  await expect(page.getByRole('heading', { name: '다시 만나서 반가워요, 바다님!' })).toBeVisible()
  await expect(page.getByRole('navigation', { name: '주요 메뉴' })).toBeVisible()
})

test('uses the training records calendar and closes the detail panel from the backdrop', async ({
  page,
}) => {
  await authenticate(page)
  const selectedDate = new Date()
  const weeklyStartDate = new Date(
    selectedDate.getFullYear(),
    selectedDate.getMonth(),
    selectedDate.getDate() - 6,
  )
  const formatDate = (date: Date) => `${date.getMonth() + 1}월 ${date.getDate()}일`
  const record = {
    recordId: 1,
    sessionId: 'test-session',
    trainedAt: selectedDate.toISOString(),
    scenarioId: 1,
    scenarioName: '상담 예약하기',
    sessionType: 'SCENARIO',
    aiPersonality: 'NORMAL',
    durationSeconds: 132,
    anxietyScore: 4,
    positiveFeedbacks: [],
  }

  await page.route('**/api/v1/training-records?page=0&size=100', async (route) => {
    await route.fulfill({
      contentType: 'application/json',
      body: JSON.stringify({
        status: 200,
        message: 'OK',
        data: {
          totalElements: 1,
          totalPages: 1,
          number: 0,
          content: [record],
        },
      }),
    })
  })
  await page.route('**/api/v1/training-records/1', async (route) => {
    await route.fulfill({
      contentType: 'application/json',
      body: JSON.stringify({ status: 200, message: 'OK', data: record }),
    })
  })

  await page.goto('/records')

  await expect(page.getByRole('tab', { name: '일별' })).toHaveAttribute('aria-selected', 'true')

  await page.getByRole('tab', { name: '주별' }).click()
  await page.locator('button[aria-haspopup="dialog"]').click()
  await expect(page.getByRole('dialog', { name: '훈련 기록 날짜 범위 선택' })).toBeVisible()
  await page
    .locator(
      `button[aria-label^="${selectedDate.getFullYear()}년 ${selectedDate.getMonth() + 1}월 ${selectedDate.getDate()}일"]`,
    )
    .click()
  await page.getByRole('button', { name: '적용', exact: true }).click()
  await expect(page.locator('button[aria-haspopup="dialog"]')).toContainText(
    `${formatDate(weeklyStartDate)} ~ ${formatDate(selectedDate)}`,
  )

  await page.getByRole('button', { name: '상담 예약하기 기록 상세 보기' }).click()
  await expect(page.locator('aside[aria-label="훈련 기록 상세"]')).toBeVisible()
  await page.locator('button[aria-label="훈련 기록 상세 닫기"]').first().click()
  await expect(page.locator('aside[aria-label="훈련 기록 상세"]')).toBeHidden()
})
