import { expect, test } from '@playwright/test'

test('moves quickly through intermediate scroll positions to download and supports repeated links', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1280, height: 900 })
  await page.goto('/')
  const navigation = page.getByRole('navigation', { name: '랜딩 메뉴' })
  await expect(navigation.getByRole('link', { name: '웹에서 시작하기', exact: true })).toBeVisible()
  const download = page
    .getByRole('navigation', { name: '랜딩 메뉴' })
    .getByRole('link', { name: '앱 다운로드', exact: true })
  await page.evaluate(() => {
    const samples: number[] = []
    Object.assign(window, { landingScrollSamples: samples })
    window.addEventListener('scroll', () => samples.push(window.scrollY))
  })
  const destination = await page
    .locator('#download')
    .evaluate((element) =>
      Math.min(
        (element as HTMLElement).offsetTop - parseFloat(getComputedStyle(element).scrollMarginTop),
        document.documentElement.scrollHeight - window.innerHeight,
      ),
    )
  await download.click()
  await expect(page).toHaveURL(/#download$/)
  await expect
    .poll(() => page.evaluate(() => window.scrollY), { timeout: 1500 })
    .toBeCloseTo(destination, 0)
  await expect(page.getByRole('heading', { name: '앱으로 시작해보기' })).toBeInViewport({
    timeout: 1500,
  })
  const samples = await page.evaluate(
    () => (window as unknown as { landingScrollSamples: number[] }).landingScrollSamples,
  )
  expect(
    samples.filter((position) => position > 100 && position < destination - 100).length,
  ).toBeGreaterThan(1)
  await page.evaluate(() => window.scrollTo(0, 0))
  await expect(page.getByRole('heading', { level: 1 })).toBeInViewport()
  await download.click()
  await expect(page.getByRole('heading', { name: '앱으로 시작해보기' })).toBeInViewport({
    timeout: 1500,
  })
})

test('slides the header away on downward scroll and restores it after a slight upward scroll', async ({
  page,
}) => {
  for (const width of [390, 1280]) {
    await page.setViewportSize({ width, height: 900 })
    await page.goto('/')
    const header = page.locator('[data-landing-header]')
    await page.mouse.move(width / 2, 450)
    await page.mouse.wheel(0, 450)
    await expect
      .poll(async () => {
        const box = (await header.boundingBox())!
        return box.y + box.height
      })
      .toBeLessThanOrEqual(0)
    await page.mouse.wheel(0, -12)
    await expect.poll(async () => (await header.boundingBox())!.y).toBeCloseTo(0, 0)
    await page.mouse.wheel(0, 30)
    await expect
      .poll(async () => {
        const box = (await header.boundingBox())!
        return box.y + box.height
      })
      .toBeLessThanOrEqual(0)
  }
})

test('keeps section navigation immediate for reduced motion preferences', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.goto('/')
  await page
    .getByRole('navigation', { name: '랜딩 메뉴' })
    .getByRole('link', { name: '앱 다운로드', exact: true })
    .click()
  await expect(page.getByRole('heading', { name: '앱으로 시작해보기' })).toBeInViewport()
  await expect(page.locator('[data-landing-header]')).toHaveCSS('transition-duration', '0s')
})
