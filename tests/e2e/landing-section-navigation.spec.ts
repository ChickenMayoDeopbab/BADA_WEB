import { expect, test } from '@playwright/test'

test('automatically enlarges the BADA logo and reveals the first view without user input', async ({
  page,
}) => {
  await page.goto('/')
  const intro = page.locator('[data-brand-intro]')
  await expect(intro).toBeVisible()
  const logo = intro.locator('.brand-intro-logo')
  const width = (await logo.boundingBox())!.width
  await expect
    .poll(async () => (await logo.boundingBox())?.width ?? 0, { intervals: [50] })
    .toBeGreaterThan(width * 3)
  await expect(intro).toHaveCount(0)
  await expect(page.getByRole('heading', { level: 1 })).toBeInViewport()
  await expect(
    page
      .getByRole('navigation', { name: '페이지 구간' })
      .getByRole('link', { name: '처음', exact: true }),
  ).toHaveAttribute('aria-current', 'location')
})

test('marks the current section, moves smoothly, and finishes its reveal while scrolling is stopped', async ({
  page,
}) => {
  await page.goto('/')
  const rail = page.getByRole('navigation', { name: '페이지 구간' })
  await rail.getByRole('link', { name: '자가진단', exact: true }).click()
  await expect(page.locator('[data-brand-intro]')).toHaveCount(0)
  await expect(rail.getByRole('link', { name: '자가진단', exact: true })).toHaveAttribute(
    'aria-current',
    'location',
  )
  await expect
    .poll(async () => (await page.locator('#diagnosis').boundingBox())!.y)
    .toBeCloseTo(0, 0)
  const position = await page.evaluate(() => window.scrollY)
  await expect(page.locator('.landing-diagnosis-panel')).not.toHaveCSS('transform', 'none')
  await expect(page.locator('.landing-diagnosis-panel')).toHaveCSS('transform', 'none')
  expect(await page.evaluate(() => window.scrollY)).toBeCloseTo(position, 0)
  await rail.getByRole('link', { name: '앱 다운로드', exact: true }).click()
  await expect(rail.getByRole('link', { name: '앱 다운로드', exact: true })).toHaveAttribute(
    'aria-current',
    'location',
  )
  await rail.getByRole('link', { name: '처음', exact: true }).click()
  await expect(page.getByRole('heading', { level: 1 })).toBeInViewport()
  await expect(page.locator('[data-brand-intro]')).toHaveCount(0)
})

test('offers an accessible mobile section menu that closes after selection or Escape', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto('/')
  const rail = page.getByRole('navigation', { name: '페이지 구간' })
  const toggle = rail.getByRole('button', { name: /구간 이동 메뉴/ })
  await toggle.click()
  await expect(toggle).toHaveAttribute('aria-expanded', 'true')
  await expect(rail.getByRole('link')).toHaveCount(6)
  await rail.getByRole('link', { name: '자주 묻는 질문', exact: true }).click()
  await expect(toggle).toHaveAttribute('aria-expanded', 'false')
  await expect(toggle).toHaveAttribute('aria-label', /현재 자주 묻는 질문/)
  await toggle.click()
  await rail.getByRole('link', { name: '처음', exact: true }).focus()
  await page.keyboard.press('Escape')
  await expect(toggle).toBeFocused()
  await expect(toggle).toHaveAttribute('aria-expanded', 'false')
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(390)
})

test('skips the opening and all section transforms for reduced motion', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.goto('/')
  await expect(page.locator('.brand-page')).toHaveAttribute('data-brand-ready', 'true')
  await expect(page.locator('[data-brand-intro]')).toHaveCount(0)
  await page
    .getByRole('navigation', { name: '페이지 구간' })
    .getByRole('link', { name: '자가진단', exact: true })
    .click()
  await expect(page.locator('.landing-diagnosis-panel')).toHaveCSS('transform', 'none')
})

test('opens a direct section link without replaying the brand opening', async ({ page }) => {
  await page.goto('/#download')
  await expect(page.locator('[data-brand-intro]')).toHaveCount(0)
  await expect(page.getByRole('heading', { name: '앱으로 시작해보기' })).toBeInViewport()
})
