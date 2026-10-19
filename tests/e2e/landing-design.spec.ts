import { expect, test } from '@playwright/test'

test('keeps the actual Figma app assets local and proportionate across all three scenes', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 1000 })
  await page.goto('/')
  await expect(page.locator('.brand-page')).toHaveAttribute('data-brand-ready', 'true')
  for (const tab of ['상황 고르기', 'AI 통화 연습', '돌아보기']) {
    await page.getByRole('tab', { name: tab, exact: true }).click()
    await expect(page.getByRole('tab', { name: tab, exact: true })).toHaveAttribute(
      'aria-selected',
      'true',
    )
    const screen = page.locator('.brand-tour-screen[data-current="true"] .app-screen')
    await expect(screen).toHaveCSS('width', '402px')
    await expect(screen).toHaveCSS('height', '874px')
    await expect
      .poll(() =>
        screen
          .locator('img')
          .evaluateAll((images) =>
            images.every(
              (el) =>
                (el as HTMLImageElement).complete && (el as HTMLImageElement).naturalWidth > 0,
            ),
          ),
      )
      .toBe(true)
    const assets = await screen.locator('img').evaluateAll((images) =>
      images.map((el) => {
        const img = el as HTMLImageElement
        return {
          src: img.currentSrc,
          width: parseFloat(getComputedStyle(img).width),
          height: parseFloat(getComputedStyle(img).height),
          naturalWidth: img.naturalWidth,
          naturalHeight: img.naturalHeight,
        }
      }),
    )
    for (const asset of assets) {
      expect(
        asset.src.startsWith('data:image/') ||
          new URL(asset.src).origin === 'http://127.0.0.1:4173',
      ).toBe(true)
      if (asset.src.endsWith('.svg') || asset.src.startsWith('data:image/svg+xml')) {
        expect(Math.abs(asset.width - asset.naturalWidth)).toBeLessThan(1)
        expect(Math.abs(asset.height - asset.naturalHeight)).toBeLessThan(1)
      }
    }
  }
})

test('keeps the editorial hero, navigation, and readable sections within small and large screens', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  for (const width of [320, 390, 768, 1280, 1440]) {
    await page.setViewportSize({ width, height: 900 })
    await page.goto('/')
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('망설임에서,첫마디로.')
    await expect(page.locator('.brand-hero-start')).toBeInViewport()
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(width)
    for (const selector of ['#hero-title', '.brand-hero-object']) {
      const box = (await page.locator(selector).boundingBox())!
      expect(box.x).toBeGreaterThanOrEqual(0)
      expect(box.x + box.width).toBeLessThanOrEqual(width)
    }
    await expect(
      page
        .getByRole('navigation', { name: '랜딩 메뉴' })
        .getByRole('link', { name: '웹에서 시작하기', exact: true }),
    ).toBeVisible()
    for (const section of ['#warmup', '.brand-community', '#faq', '#download']) {
      const box = (await page.locator(section).boundingBox())!
      expect(box.width).toBeLessThanOrEqual(width)
    }
  }
})

test('keeps legal navigation and returning to the landing free of animation residue', async ({
  page,
}) => {
  const errors: string[] = []
  page.on('pageerror', (error) => errors.push(error.message))
  await page.goto('/')
  await expect(page.locator('.brand-page')).toHaveAttribute('data-brand-ready', 'true')
  await page.getByRole('link', { name: '개인정보처리방침', exact: true }).click()
  await expect(page.getByRole('heading', { level: 1 })).toBeInViewport()
  await page.getByRole('link', { name: '홈으로', exact: true }).click()
  await expect(page.locator('.brand-page')).toHaveAttribute('data-brand-ready', 'true')
  await expect(page.locator('.brand-hero-start')).toBeInViewport()
  expect(errors).toEqual([])
})
