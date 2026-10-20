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
  const motion = await page.evaluate(
    () =>
      new Promise<{
        greenHoldMs: number
        didGreenLead: boolean
        didGreenFall: boolean
        didWhiteFall: boolean
      }>((resolve) => {
        let holdStart = -1
        let greenHoldMs = 0
        let didGreenLead = false
        let didGreenFall = false
        let didWhiteFall = false
        /** 같은 프레임에서 불투명한 초록 화면과 두 카드의 낙하 순서를 관찰합니다. */
        const sample = () => {
          const cover = document.querySelector('[data-brand-intro]')
          if (
            cover &&
            getComputedStyle(cover).clipPath === 'inset(0%)' &&
            getComputedStyle(cover, '::after').clipPath === 'circle(150% at 50% 50%)'
          ) {
            if (holdStart < 0) holdStart = performance.now()
            greenHoldMs = performance.now() - holdStart
          }
          const green = getComputedStyle(document.querySelector('[data-hero-card="greeting"]')!)
          const white = getComputedStyle(document.querySelector('[data-hero-card="answer"]')!)
          didGreenLead ||= Number(green.opacity) > 0.1 && Number(white.opacity) === 0
          didGreenFall ||=
            Number(green.opacity) > 0.1 && new DOMMatrixReadOnly(green.transform).m42 < -1
          didWhiteFall ||=
            Number(white.opacity) > 0.1 && new DOMMatrixReadOnly(white.transform).m42 < -1
          if (
            document.querySelector('[data-landing-hero]')?.getAttribute('data-hero-entered') ===
            'true'
          ) {
            resolve({ greenHoldMs, didGreenLead, didGreenFall, didWhiteFall })
          } else requestAnimationFrame(sample)
        }
        sample()
      }),
  )
  expect(motion.greenHoldMs).toBeGreaterThan(300)
  expect(motion.didGreenLead).toBe(true)
  expect(motion.didGreenFall).toBe(true)
  expect(motion.didWhiteFall).toBe(true)
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
  await expect(page.locator('[data-hero-card="greeting"]')).toHaveCSS('animation-name', 'none')
  await expect(page.locator('[data-hero-card="answer"]')).toHaveCSS('transform', 'none')
  await page
    .getByRole('navigation', { name: '페이지 구간' })
    .getByRole('link', { name: '자가진단', exact: true })
    .click()
  await expect(page.locator('.landing-diagnosis-panel')).toHaveCSS('transform', 'none')
})

test('keeps the cards moving in sequence while idle and pauses them outside the hero', async ({
  page,
}) => {
  for (const width of [390, 1280]) {
    await page.setViewportSize({ width, height: 900 })
    await page.goto('/#intro')
    await expect(page.locator('[data-landing-hero]')).toHaveAttribute('data-hero-entered', 'true')
    const green = page.locator('[data-hero-card="greeting"]')
    const white = page.locator('[data-hero-card="answer"]')
    await expect(green).toHaveCSS('animation-play-state', 'running')
    await expect(white).toHaveCSS('animation-delay', '0.45s')
    const position = await green.evaluate((element) => getComputedStyle(element).translate)
    await expect
      .poll(() => green.evaluate((element) => getComputedStyle(element).translate))
      .not.toBe(position)
    await page
      .getByRole('navigation', { name: '랜딩 메뉴' })
      .getByRole('link', { name: '앱 다운로드', exact: true })
      .click()
    await expect(green).toHaveCSS('animation-play-state', 'paused')
    await expect(white).toHaveCSS('animation-play-state', 'paused')
  }
})

test('opens a direct section link without replaying the brand opening', async ({ page }) => {
  await page.goto('/#download')
  await expect(page.locator('[data-brand-intro]')).toHaveCount(0)
  await expect(page.getByRole('heading', { name: '앱으로 시작해보기' })).toBeInViewport()
})
