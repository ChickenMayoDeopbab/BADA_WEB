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

/** 목업 전환의 특정 지점에서 스크롤을 멈춥니다. */
const stopTourAt = async (page: Page, progress: number) => {
  await page.evaluate((value) => {
    const story = document.getElementById('experience')!
    const start = window.scrollY + story.getBoundingClientRect().top - 80
    window.scrollTo(0, start + (story.offsetHeight - (window.innerHeight - 80)) * value)
  }, progress)
}

/** 부드러운 추적까지 끝난 실제 목업 진행률을 읽습니다. */
const getTourProgress = (page: Page) =>
  page
    .locator('#experience')
    .evaluate((element) =>
      Number((element as HTMLElement).style.getPropertyValue('--tour-progress')),
    )

test('finishes interrupted transitions in either direction and leaves reading positions alone', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1280, height: 900 })
  await page.goto('/')
  await expect(page.locator('.brand-page')).toHaveAttribute('data-brand-ready', 'true')
  await expect(page.locator('[data-tour-device]')).not.toHaveCSS('transform', 'none')
  for (const [stop, target, scene] of [
    [0.28, 0.4, 'AI 통화 연습'],
    [0.28, 0.2, '상황 고르기'],
    [0.68, 0.8, '돌아보기'],
    [0.68, 0.6, 'AI 통화 연습'],
  ] as const) {
    await stopTourAt(page, stop)
    await expect.poll(() => getTourProgress(page)).toBeCloseTo(target, 2)
    await expect(page.getByRole('tab', { name: scene, exact: true })).toHaveAttribute(
      'aria-selected',
      'true',
    )
    await expect(page.getByRole('tabpanel')).toHaveCSS('opacity', '1')
    await expect(page.locator('[data-tour-callout]')).toHaveCSS('opacity', '1')
    const device = (await page.locator('[data-tour-device]').boundingBox())!
    const copy = (await page.getByRole('tabpanel').boundingBox())!
    expect(device.x + device.width <= copy.x || device.x >= copy.x + copy.width).toBe(true)
  }
  await stopTourAt(page, 0.48)
  await expect.poll(() => getTourProgress(page)).toBeCloseTo(0.48, 2)
  await page.waitForTimeout(1000)
  expect(await getTourProgress(page)).toBeCloseTo(0.48, 2)
  await page.evaluate(() => document.getElementById('faq')!.scrollIntoView())
  const outsidePosition = await page.evaluate(() => window.scrollY)
  await page.waitForTimeout(1000)
  expect(await page.evaluate(() => window.scrollY)).toBe(outsidePosition)
})

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

test('wiggles the voice line while idle, calms it on scroll, and pauses offscreen or for reduced motion', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1280, height: 900 })
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.goto('/')
  await expect(page.locator('.brand-page')).toHaveAttribute('data-brand-ready', 'true')
  const voice = page.locator('[data-voice-path]')
  const staticVoice = (await voice.getAttribute('d'))!
  await page.emulateMedia({ reducedMotion: 'no-preference' })
  await expect(voice).not.toHaveAttribute('d', staticVoice)
  const movingVoice = (await voice.getAttribute('d'))!
  await expect(voice).not.toHaveAttribute('d', movingVoice)
  expect(await page.evaluate(() => window.scrollY)).toBe(0)
  // 좌표의 꺾임이 줄어야 실제 스크롤 모핑이며, 제자리 흔들림만으로는 통과하지 않습니다.
  const getRoughness = () =>
    voice.evaluate((path) => {
      const points = [...path.getAttribute('d')!.matchAll(/[ML][\d.]+,(-?[\d.]+)/g)].map((match) =>
        Number(match[1]),
      )
      return points
        .slice(1, -1)
        .reduce(
          (sum, point, index) => sum + Math.abs(points[index + 2] - 2 * point + points[index]),
          0,
        )
    })
  const initialRoughness = await getRoughness()
  await page.mouse.wheel(0, 450)
  await expect.poll(getRoughness).toBeLessThan(initialRoughness * 0.8)
  await page.evaluate(() => document.getElementById('diagnosis')!.scrollIntoView())
  await page.waitForTimeout(150)
  const pausedVoice = (await voice.getAttribute('d'))!
  await page.waitForTimeout(200)
  await expect(voice).toHaveAttribute('d', pausedVoice)
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await expect(voice).toHaveAttribute('d', staticVoice)
  await page.evaluate(() => window.scrollTo(0, 0))
  await page.waitForTimeout(200)
  await expect(voice).toHaveAttribute('d', staticVoice)
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
