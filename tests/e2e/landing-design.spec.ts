import { expect, test } from '@playwright/test'

test('renders all three Figma screens with local assets and original SVG dimensions', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 1000 })
  await page.goto('/')
  const screens = page.locator('[data-landing-hero] .app-screen')
  await expect(screens).toHaveCount(3)
  for (const screen of await screens.all()) {
    await expect(screen).toHaveCSS('width', '402px')
    await expect(screen).toHaveCSS('height', '874px')
    await expect
      .poll(() =>
        screen
          .locator('img')
          .evaluateAll((images) =>
            images.every(
              (image) =>
                (image as HTMLImageElement).complete &&
                (image as HTMLImageElement).naturalWidth > 0,
            ),
          ),
      )
      .toBe(true)
    const assets = await screen.locator('img').evaluateAll((images) =>
      images.map((element) => {
        const image = element as HTMLImageElement
        return {
          src: image.currentSrc,
          width: parseFloat(getComputedStyle(image).width),
          height: parseFloat(getComputedStyle(image).height),
          naturalWidth: image.naturalWidth,
          naturalHeight: image.naturalHeight,
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
  await page.screenshot({ path: test.info().outputPath('bada-brand-desktop.png') })
  await page.setViewportSize({ width: 390, height: 844 })
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(390)
  await page.screenshot({ path: test.info().outputPath('bada-brand-mobile.png') })
})

test('emphasizes the brand story line by line while respecting reduced motion', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1280, height: 900 })
  await page.goto('/')
  const story = page.locator('[data-landing-story]')
  const lines = story.locator('[data-story-line]')
  await expect(lines.nth(2)).toHaveCSS('opacity', '0.25')
  await story.evaluate((element) =>
    window.scrollTo(0, window.scrollY + element.getBoundingClientRect().top - 250),
  )
  await expect(lines.nth(0)).toHaveCSS('opacity', '1')
  await expect(lines.nth(2)).not.toHaveCSS('opacity', '1')
  await page.mouse.wheel(0, 250)
  await expect(lines.nth(2)).toHaveCSS('opacity', '1')
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await expect(lines.nth(0)).toHaveCSS('opacity', '1')
  await expect(lines.nth(2)).toHaveCSS('opacity', '1')
})
