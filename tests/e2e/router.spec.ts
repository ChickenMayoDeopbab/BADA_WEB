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
