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
  await page.goto('/records')

  await expect(page.getByRole('tab', { name: '일별' })).toHaveAttribute('aria-selected', 'true')

  await page.locator('button[aria-haspopup="dialog"]').click()
  await expect(page.getByRole('dialog', { name: '훈련 기록 날짜 범위 선택' })).toBeVisible()
  await page.getByRole('button', { name: '취소', exact: true }).click()

  await page.getByRole('button', { name: '피자 주문하기 기록 상세 보기' }).first().click()
  await expect(page.locator('aside[aria-label="훈련 기록 상세"]')).toBeVisible()
  await page.locator('button[aria-label="훈련 기록 상세 닫기"]').first().click()
  await expect(page.locator('aside[aria-label="훈련 기록 상세"]')).toBeHidden()
})
