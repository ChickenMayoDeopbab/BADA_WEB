import { expect, test } from '@playwright/test'

test('renders the landing page', async ({ page }) => {
  await page.goto('/')

  await expect(page.getByRole('heading', { name: '랜딩 페이지' })).toBeVisible()
  await expect
    .poll(() => page.evaluate(() => document.fonts.check('16px "Pretendard Variable"')))
    .toBe(true)
})

test('renders a service route while the auth guard is disabled', async ({ page }) => {
  await page.goto('/dashboard')

  await expect(page.getByRole('heading', { name: '대시보드 화면' })).toBeVisible()
  await expect(page.getByRole('navigation', { name: '주요 메뉴' })).toBeVisible()
})

test('uses the training records calendar and closes the detail panel from the backdrop', async ({
  page,
}) => {
  const selectedDate = new Date()
  const weeklyStartDate = new Date(
    selectedDate.getFullYear(),
    selectedDate.getMonth(),
    selectedDate.getDate() - 6,
  )
  const formatDate = (date: Date) => `${date.getMonth() + 1}월 ${date.getDate()}일`

  await page.goto('/records')

  await expect(page.getByRole('tab', { name: '일별' })).toHaveAttribute('aria-selected', 'true')

  await page.getByRole('tab', { name: '주별' }).click()
  await page.locator('button[aria-haspopup="dialog"]').click()
  await expect(page.getByRole('dialog', { name: '훈련 기록 날짜 범위 선택' })).toBeVisible()
  await page
    .locator(
      `button[aria-label="${selectedDate.getFullYear()}년 ${selectedDate.getMonth() + 1}월 ${selectedDate.getDate()}일"]`,
    )
    .click()
  await page.getByRole('button', { name: '적용', exact: true }).click()
  await expect(page.locator('button[aria-haspopup="dialog"]')).toContainText(
    `${formatDate(weeklyStartDate)} ~ ${formatDate(selectedDate)}`,
  )

  await page.getByRole('button', { name: '피자 주문하기 기록 상세 보기' }).first().click()
  await expect(page.locator('aside[aria-label="훈련 기록 상세"]')).toBeVisible()
  await page.locator('button[aria-label="훈련 기록 상세 닫기"]').first().click()
  await expect(page.locator('aside[aria-label="훈련 기록 상세"]')).toBeHidden()
})
