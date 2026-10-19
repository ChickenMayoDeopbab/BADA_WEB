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
      const note = (await page.locator('[data-tour-callout]').boundingBox())!
      expect(note.x).toBeGreaterThanOrEqual(0)
      expect(note.x + note.width).toBeLessThanOrEqual(1280)
      await expect(page.locator('.brand-tour-number')).toHaveText(`0${index + 1}`)
      await expect(page.locator('.brand-tour-focus')).toHaveCSS('border-top-style', 'dashed')
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

test('morphs the voice line with scrolling and restores it for reduced motion', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1280, height: 900 })
  await page.goto('/')
  await expect(page.locator('.brand-page')).toHaveAttribute('data-brand-ready', 'true')
  const voice = page.locator('[data-voice-path]')
  const initialVoice = await voice.getAttribute('d')
  await page.mouse.wheel(0, 450)
  await expect(voice).not.toHaveAttribute('d', initialVoice!)
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await expect(voice).toHaveAttribute('d', initialVoice!)
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
  await expect(page.locator('[data-tour-carrier]')).toHaveCSS('transform', 'none')
  await expect(page.locator('[data-tour-device]')).toHaveCSS('transform', 'none')
  await page.setViewportSize({ width: 390, height: 844 })
  await page.getByRole('tab', { name: 'AI 통화 연습', exact: true }).click()
  await expect(
    page.locator('.brand-tour-screen[data-current="true"] [data-app-screen]'),
  ).toHaveAttribute('data-app-screen', 'call')
  await expect(page.locator('[data-tour-callout]')).toContainText(
    '스크립트를 보며 천천히 이어가요.',
  )
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(390)
})
