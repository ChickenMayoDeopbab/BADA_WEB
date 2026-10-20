import { expect, test } from '@playwright/test'

test.use({ hasTouch: true })

test('advances the mobile phone through all scenes on native scrolling and keeps controls in view', async ({
  page,
}) => {
  for (const viewport of [
    { width: 390, height: 844 },
    { width: 320, height: 740 },
    { width: 320, height: 568 },
    { width: 317, height: 590 },
    { width: 375, height: 667 },
    { width: 390, height: 680 },
    { width: 768, height: 1024 },
  ]) {
    await page.setViewportSize(viewport)
    await page.goto('/#experience')
    const stageTop = viewport.width >= 640 ? 80 : 72
    const story = page.locator('#experience')
    await expect(story).toHaveAttribute('data-mobile-story', 'true')
    const first = page.getByRole('tab', { name: '상황 고르기', exact: true })
    await first.tap()
    for (const [index, variant] of ['scenario', 'call', 'report'].entries()) {
      if (index) await page.mouse.wheel(0, viewport.height * 0.8)
      await expect(story).toHaveAttribute('data-active-scene', String(index))
      await expect(
        page.locator('.brand-tour-screen[data-current="true"] [data-app-screen]'),
      ).toHaveAttribute('data-app-screen', variant)
      await expect
        .poll(async () => (await page.locator('[data-feature-stage]').boundingBox())!.y)
        .toBeCloseTo(stageTop, 0)
      for (const selector of ['[data-tour-device]', '[data-tour-callout]', '.brand-tour-copy']) {
        const box = (await page.locator(selector).filter({ visible: true }).boundingBox())!
        expect(box.x).toBeGreaterThanOrEqual(0)
        expect(box.x + box.width).toBeLessThanOrEqual(viewport.width)
        expect(box.y).toBeGreaterThanOrEqual(stageTop)
        expect(box.y + box.height).toBeLessThanOrEqual(viewport.height)
      }
      const note = (await page.locator('[data-tour-callout]').boundingBox())!
      if (viewport.width < 768) {
        const menu = (await page.getByRole('button', { name: /구간 이동 메뉴/ }).boundingBox())!
        expect(note.y + note.height).toBeLessThanOrEqual(menu.y)
      }
      const copy = (await page.locator('.brand-tour-copy').filter({ visible: true }).boundingBox())!
      const device = (await page.locator('[data-tour-device]').boundingBox())!
      expect(copy.y + copy.height).toBeLessThanOrEqual(device.y)
    }
    await page.mouse.wheel(0, -viewport.height * 0.8)
    await expect(story).toHaveAttribute('data-active-scene', '1')
    await page.getByRole('tab', { name: '돌아보기', exact: true }).click()
    await expect(story).toHaveAttribute('data-active-scene', '2')
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(viewport.width)
  }
})

test('restores the mobile tour after desktop resizing and keeps short screens and reduced motion usable', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1280, height: 900 })
  await page.goto('/#experience')
  await expect(page.locator('[data-tour-device]')).not.toHaveCSS('transform', 'none')
  await page.setViewportSize({ width: 390, height: 844 })
  await expect(page.locator('#experience')).toHaveAttribute('data-mobile-story', 'true')
  await expect(page.locator('[data-tour-device]')).toHaveCSS('transform', 'none')
  await page.getByRole('tab', { name: '돌아보기', exact: true }).click()
  await expect(page.locator('#experience')).toHaveAttribute('data-active-scene', '2')
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await expect(page.locator('#experience')).toHaveAttribute('data-scroll-story', 'false')
  await expect(page.locator('[data-feature-stage]')).toHaveCSS('position', 'relative')
  await page.getByRole('tab', { name: 'AI 통화 연습', exact: true }).click()
  await expect(page.locator('#experience')).toHaveAttribute('data-active-scene', '1')
  await page.emulateMedia({ reducedMotion: 'no-preference' })
  await page.setViewportSize({ width: 844, height: 390 })
  await expect(page.locator('#experience')).toHaveAttribute('data-scroll-story', 'false')
  await page.getByRole('tab', { name: '돌아보기', exact: true }).click()
  await expect(page.locator('#experience')).toHaveAttribute('data-active-scene', '2')
})
