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

test('holds the full-screen download stage during native scrolling and releases into the footer', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1280, height: 900 })
  await page.goto('/')
  await expect(page.locator('.brand-page')).toHaveAttribute('data-brand-ready', 'true')
  await page
    .getByRole('navigation', { name: '랜딩 메뉴' })
    .getByRole('link', { name: '앱 다운로드', exact: true })
    .click()
  const stage = page.locator('[data-download-stage]')
  await expect.poll(async () => (await stage.boundingBox())!.y).toBeCloseTo(0, 0)
  expect((await stage.boundingBox())!.height).toBe(900)
  await expect(
    page.getByRole('link', { name: 'Google Play에서 BADA 다운로드 (새 탭)' }),
  ).toBeInViewport()
  const start = await page.evaluate(() => window.scrollY)
  await page.mouse.move(640, 450)
  await page.mouse.wheel(0, 240)
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBeGreaterThan(start + 200)
  await expect.poll(async () => (await stage.boundingBox())!.y).toBeCloseTo(0, 0)
  await expect(page.getByRole('contentinfo')).not.toBeInViewport()
  await page.mouse.wheel(0, 1000)
  await expect(page.getByRole('contentinfo')).toBeInViewport()
})

test('fits both store links on a mobile screen and skips the extra hold for reduced motion', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.goto('/#download')
  await expect(page.locator('[data-download-stage]')).toHaveCSS('position', 'relative')
  await expect(page.getByRole('heading', { name: '앱으로 시작해보기' })).toBeInViewport()
  for (const name of ['App Store', 'Google Play']) {
    await expect(
      page.getByRole('link', { name: `${name}에서 BADA 다운로드 (새 탭)` }),
    ).toBeInViewport()
  }
  const section = (await page.locator('#download').boundingBox())!
  const stage = (await page.locator('[data-download-stage]').boundingBox())!
  expect(section.height).toBe(stage.height)
})

test('keeps compact store badges reachable on small phones and landscape web views', async ({
  page,
}) => {
  for (const viewport of [
    { width: 320, height: 568 },
    { width: 390, height: 844 },
    { width: 844, height: 390 },
  ]) {
    await page.setViewportSize(viewport)
    await page.goto('/#download')
    await expect(page.locator('[data-download-stage]')).toHaveCSS('position', 'relative')
    for (const name of ['App Store', 'Google Play']) {
      const store = page.getByRole('link', { name: `${name}에서 BADA 다운로드 (새 탭)` })
      await expect(store).toBeInViewport({ ratio: 1 })
      const box = (await store.boundingBox())!
      expect(box.height).toBeGreaterThanOrEqual(44)
      expect(box.width).toBeLessThanOrEqual(224)
      expect(box.x).toBeGreaterThanOrEqual(0)
      expect(box.x + box.width).toBeLessThanOrEqual(viewport.width)
    }
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(viewport.width)
  }
})
