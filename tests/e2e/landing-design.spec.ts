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

test('fills the first viewport with green and swaps the header and hero actions', async ({
  page,
}) => {
  for (const viewport of [
    { width: 1280, height: 900 },
    { width: 390, height: 844 },
  ]) {
    await page.setViewportSize(viewport)
    await page.goto('/')
    const hero = page.locator('[data-landing-hero]')
    const box = (await hero.boundingBox())!
    expect(box.x).toBe(0)
    expect(box.y).toBe(0)
    expect(box.width).toBe(viewport.width)
    expect(box.height).toBeGreaterThanOrEqual(viewport.height)
    await expect(hero).toHaveCSS('border-radius', '0px')
    await expect(
      page
        .getByRole('navigation', { name: '랜딩 메뉴' })
        .getByRole('link', { name: '웹에서 시작하기', exact: true }),
    ).toHaveAttribute('href', '/login')
    await expect(hero.getByRole('link', { name: '앱 다운로드', exact: true })).toHaveAttribute(
      'href',
      '#download',
    )
    await expect(page.getByRole('link', { name: 'BADA 알아보기', exact: true })).toHaveCount(0)
  }
})

test('grows the web entry button without fading and prevents native dragging and selection', async ({
  page,
}) => {
  await page.goto('/')
  const entry = page
    .getByRole('navigation', { name: '랜딩 메뉴' })
    .getByRole('link', { name: '웹에서 시작하기', exact: true })
  await page.mouse.move(500, 200)
  const width = (await entry.boundingBox())!.width
  await entry.hover()
  await expect.poll(async () => (await entry.boundingBox())!.width).toBeGreaterThan(width * 1.04)
  await expect(entry).toHaveCSS('opacity', '1')
  await expect(page.getByRole('heading', { level: 1 })).toHaveCSS('user-select', 'none')
  const isDragCanceled = await page
    .locator('[data-landing-hero] img')
    .first()
    .evaluate(
      (element) =>
        !element.dispatchEvent(new DragEvent('dragstart', { bubbles: true, cancelable: true })),
    )
  expect(isDragCanceled).toBe(true)
  await page.emulateMedia({ reducedMotion: 'reduce' })
  for (const device of await page.locator('.hero-device > .app-device').all()) {
    await expect(device).toHaveCSS('animation-name', 'none')
  }
})
