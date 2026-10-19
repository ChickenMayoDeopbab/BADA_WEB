import { expect, test, type Page } from '@playwright/test'

/** 제품 무대의 실제 스크롤 범위에서 한 장면의 중앙으로 이동합니다. */
const scrollToFeature = async (page: Page, index: number) => {
  await page.evaluate((step) => {
    const story = document.getElementById('experience')!
    const stage = story.querySelector<HTMLElement>('[data-feature-stage]')!
    const start = window.scrollY + story.getBoundingClientRect().top - 80
    window.scrollTo(0, start + (story.offsetHeight - stage.offsetHeight) * ((step + 0.4) / 3))
  }, index)
}

test('moves one phone forward and backward through three scenes while the stage stays pinned', async ({
  page,
}) => {
  for (const height of [900, 720]) {
    await page.setViewportSize({ width: 1280, height })
    await page.goto('/')
    await expect(page.locator('.brand-page')).toHaveAttribute('data-brand-ready', 'true')
    await expect(page.locator('#experience')).toHaveAttribute('data-scroll-story', 'true')
    const positions: number[] = []
    await expect(page.locator('[data-tour-device]')).toHaveCount(1)
    for (const index of [0, 1, 2, 1]) {
      await scrollToFeature(page, index)
      await expect(
        page.getByRole('tab', {
          name: ['상황 고르기', 'AI 통화 연습', '돌아보기'][index],
          exact: true,
        }),
      ).toHaveAttribute('aria-selected', 'true')
      await expect(page.getByRole('tabpanel')).toHaveCount(1)
      await expect
        .poll(async () => (await page.locator('[data-feature-stage]').boundingBox())!.y)
        .toBeCloseTo(80, 0)
      await expect
        .poll(() =>
          page
            .locator('#experience')
            .evaluate((el) =>
              Number((el as HTMLElement).style.getPropertyValue('--tour-progress')),
            ),
        )
        .toBeCloseTo((index + 0.4) / 3, 2)
      const device = page.locator('[data-tour-device]')
      const frame = (await device.boundingBox())!
      const copy = (await page.getByRole('tabpanel').boundingBox())!
      positions.push(frame.x + frame.width / 2)
      expect(frame.x + frame.width <= copy.x || frame.x >= copy.x + copy.width).toBe(true)
      const expectedFocus = [
        '오늘은, 피자 주문부터',
        '말이 막히는 순간에도',
        '다음 한 통을 위한 발견',
      ][index]
      await expect(page.locator('[data-tour-callout]')).toContainText(expectedFocus)
      const panel = page.getByRole('tabpanel')
      await expect(
        page.locator('.brand-tour-screen[data-current="true"] [data-app-screen]'),
      ).toHaveAttribute('data-app-screen', ['scenario', 'call', 'report'][index])
      await expect
        .poll(async () => {
          const box = (await panel.locator('.brand-tour-copy').boundingBox())!
          return box.y + box.height
        })
        .toBeLessThanOrEqual(height)
      await expect
        .poll(async () => {
          const box = (await page.locator('[data-tour-device]').boundingBox())!
          return box.y + box.height
        })
        .toBeLessThanOrEqual(height)
    }
    expect(positions[0] - positions[1]).toBeGreaterThan(300)
    expect(positions[2] - positions[1]).toBeGreaterThan(300)
    expect(Math.abs(positions[1] - positions[3])).toBeLessThan(5)
  }
})

test('keeps direct scene selection and keyboard focus synchronized with the scroll timeline', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1280, height: 900 })
  await page.goto('/')
  await expect(page.locator('.brand-page')).toHaveAttribute('data-brand-ready', 'true')
  const report = page.getByRole('tab', { name: '돌아보기', exact: true })
  await report.click()
  await expect(report).toHaveAttribute('aria-selected', 'true')
  await expect
    .poll(() =>
      page
        .locator('#experience')
        .evaluate((story) =>
          Number((story as HTMLElement).style.getPropertyValue('--tour-progress')),
        ),
    )
    .toBeGreaterThan(0.7)
  await report.press('Home')
  await expect(page.getByRole('tab', { name: '상황 고르기', exact: true })).toBeFocused()
  await expect
    .poll(() =>
      page
        .locator('#experience')
        .evaluate((story) =>
          Number((story as HTMLElement).style.getPropertyValue('--tour-progress')),
        ),
    )
    .toBeLessThan(0.3)
})

test('morphs the voice line and opens the manifesto and photo masks with scrolling', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1280, height: 900 })
  await page.goto('/')
  await expect(page.locator('.brand-page')).toHaveAttribute('data-brand-ready', 'true')
  const voice = page.locator('[data-voice-path]')
  const initialVoice = await voice.getAttribute('d')
  await page.mouse.wheel(0, 450)
  await expect(voice).not.toHaveAttribute('d', initialVoice!)
  const ink = page.locator('[data-manifesto-ink]')
  const initialMask = await ink.evaluate((el) => getComputedStyle(el).clipPath)
  await page
    .locator('[data-manifesto]')
    .evaluate((el) => window.scrollTo(0, window.scrollY + el.getBoundingClientRect().top))
  await expect(ink).not.toHaveCSS('clip-path', initialMask)
  const photo = page.locator('[data-life-photo]')
  const initialPhotoMask = await photo.evaluate((el) => getComputedStyle(el).clipPath)
  await photo.evaluate((el) =>
    window.scrollTo(0, window.scrollY + el.getBoundingClientRect().top - 60),
  )
  await expect(photo).not.toHaveCSS('clip-path', initialPhotoMask)
  await expect
    .poll(() =>
      photo.evaluate((frame) => {
        const image = frame.querySelector('img')!.getBoundingClientRect()
        const box = frame.getBoundingClientRect()
        return image.top <= box.top && image.bottom >= box.bottom
      }),
    )
    .toBe(true)
  await expect(page.getByRole('heading', { name: '연습은 여기서. 용기는 일상에서.' })).toBeVisible()
})

test('restores static readable content for reduced motion and normal scene selection on mobile', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1280, height: 900 })
  await page.goto('/')
  await expect(page.locator('.brand-page')).toHaveAttribute('data-brand-ready', 'true')
  await scrollToFeature(page, 2)
  await expect(page.getByRole('tab', { name: '돌아보기', exact: true })).toHaveAttribute(
    'aria-selected',
    'true',
  )
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await expect(page.locator('#experience')).toHaveAttribute('data-scroll-story', 'false')
  await expect(page.locator('[data-feature-stage]')).toHaveCSS('position', 'relative')
  await expect(page.locator('[data-life-photo]')).toHaveCSS('clip-path', 'none')
  await expect(page.locator('[data-manifesto-ink]')).toHaveCSS('clip-path', 'none')
  await page.setViewportSize({ width: 390, height: 844 })
  await page.getByRole('tab', { name: 'AI 통화 연습', exact: true }).click()
  await expect(
    page.locator('.brand-tour-screen[data-current="true"] [data-app-screen]'),
  ).toHaveAttribute('data-app-screen', 'call')
  await expect(page.getByRole('link', { name: 'AI와 연습 시작하기', exact: true })).toBeVisible()
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(390)
})
