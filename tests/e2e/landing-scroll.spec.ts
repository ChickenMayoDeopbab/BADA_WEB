import { expect, test, type Page } from '@playwright/test'

/** 실제 스크롤 범위 안에서 지정한 기능 단계의 중간으로 이동합니다. */
const scrollToFeature = async (page: Page, index: number) => {
  await page.evaluate((step) => {
    const story = document.getElementById('experience')!
    const stage = story.querySelector<HTMLElement>('[data-feature-stage]')!
    const start = window.scrollY + story.getBoundingClientRect().top - 80
    const range = story.offsetHeight - stage.offsetHeight
    window.scrollTo(0, start + range * ((step + 0.4) / 4))
  }, index)
}

test('scrolls forward and backward through pinned feature screens without moving the stage', async ({
  page,
}) => {
  for (const height of [900, 720]) {
    await page.setViewportSize({ width: 1280, height })
    await page.goto('/')
    const story = page.locator('#experience')
    await expect(story).toHaveAttribute('data-scroll-story', 'true')
    const tabs = ['자가진단', 'AI 통화 연습', '기록과 피드백', '커뮤니티']
    for (const index of [0, 1, 2, 3, 1]) {
      await scrollToFeature(page, index)
      await expect(page.getByRole('tab', { name: tabs[index], exact: true })).toHaveAttribute(
        'aria-selected',
        'true',
      )
      await expect(page.getByRole('tabpanel')).toHaveCount(1)
      await expect
        .poll(async () => (await page.locator('[data-feature-stage]').boundingBox())!.y)
        .toBeCloseTo(80, 0)
      const panel = page.getByRole('tabpanel')
      await expect(panel.locator('.landing-feature-copy')).toHaveCSS('opacity', '1')
      expect(
        (await panel.boundingBox())!.y + (await panel.boundingBox())!.height,
      ).toBeLessThanOrEqual(height)
      if (height === 900 && index === 2)
        await page.screenshot({ path: test.info().outputPath('landing-scroll-feedback.png') })
    }
  }
})

test('keeps direct tab selection and scroll position synchronized in the pinned section', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1280, height: 900 })
  await page.goto('/')
  await expect(page.locator('#experience')).toHaveAttribute('data-scroll-story', 'true')
  await page.getByRole('tab', { name: '커뮤니티', exact: true }).click()
  await expect
    .poll(() =>
      page.evaluate(() => {
        const story = document.getElementById('experience')!
        const range =
          story.offsetHeight -
          story.querySelector<HTMLElement>('[data-feature-stage]')!.offsetHeight
        return (80 - story.getBoundingClientRect().top) / range
      }),
    )
    .toBeGreaterThan(0.75)
  await expect(page.getByRole('tab', { name: '커뮤니티', exact: true })).toHaveAttribute(
    'aria-selected',
    'true',
  )
  await page.getByRole('tab', { name: '커뮤니티', exact: true }).press('Home')
  await expect(page.getByRole('tab', { name: '자가진단', exact: true })).toBeFocused()
  await expect
    .poll(() =>
      page.evaluate(() => {
        const story = document.getElementById('experience')!
        const range =
          story.offsetHeight -
          story.querySelector<HTMLElement>('[data-feature-stage]')!.offsetHeight
        return (80 - story.getBoundingClientRect().top) / range
      }),
    )
    .toBeLessThan(0.25)
  await expect(page.getByRole('tab', { name: '자가진단', exact: true })).toHaveAttribute(
    'aria-selected',
    'true',
  )
})

test('reveals sections as they enter and updates the scroll indicator and hero depth', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1280, height: 900 })
  await page.goto('/')
  await expect(page.locator('.landing-page')).toHaveAttribute('data-motion', 'true')
  const image = page.locator('[data-hero-image]')
  const initialTransform = await image.evaluate((element) => getComputedStyle(element).transform)
  await page.mouse.wheel(0, 350)
  await expect(image).not.toHaveCSS('transform', initialTransform)
  const warmup = page.locator('#warmup')
  await warmup.scrollIntoViewIfNeeded()
  await expect(warmup).toHaveCSS('opacity', '1')
  await expect(warmup.getByRole('link', { name: '워밍업 시작하기' })).toBeInViewport()
  expect(
    await page
      .locator('.landing-page')
      .evaluate((element) =>
        Number((element as HTMLElement).style.getPropertyValue('--landing-scroll-progress')),
      ),
  ).toBeGreaterThan(0)
})

test('restores readable static content when reduced motion is enabled and uses normal mobile flow', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1280, height: 900 })
  await page.goto('/')
  await expect(page.locator('#experience')).toHaveAttribute('data-scroll-story', 'true')
  await scrollToFeature(page, 2)
  await expect(page.getByRole('tab', { name: '기록과 피드백', exact: true })).toHaveAttribute(
    'aria-selected',
    'true',
  )
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await expect(page.locator('#experience')).toHaveAttribute('data-scroll-story', 'false')
  await expect(page.locator('[data-feature-stage]')).toHaveCSS('position', 'static')
  for (const element of await page.locator('[data-reveal]').all()) {
    await expect(element).toHaveCSS('opacity', '1')
    await expect(element).toHaveCSS('transform', 'none')
  }
  await page.emulateMedia({ reducedMotion: 'no-preference' })
  await page.setViewportSize({ width: 390, height: 844 })
  await expect(page.locator('#experience')).toHaveAttribute('data-scroll-story', 'false')
  await expect(page.locator('[data-feature-stage]')).toHaveCSS('position', 'static')
  await page.getByRole('tab', { name: 'AI 통화 연습', exact: true }).click()
  await expect(page.getByRole('link', { name: '시나리오 보러 가기', exact: true })).toBeVisible()
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390)
})
