import { expect, test } from '@playwright/test'

test('updates difficulty and partner attitude independently in the real app preview without starting a call', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 })
  const apiRequests: string[] = []
  await page.route(
    (url) => url.pathname.startsWith('/api/'),
    (route) => {
      apiRequests.push(route.request().url())
      return route.abort()
    },
  )
  await page.goto('/')
  const preview = page.locator('#practice')
  const difficulty = preview.getByRole('group', { name: '난이도', exact: true })
  const personality = preview.getByRole('group', { name: '상대의 태도', exact: true })
  const thumb = preview.locator('.app-settings-difficulty .app-settings-thumb')
  const initial = await thumb.evaluate((image) => parseFloat(getComputedStyle(image).left))
  await difficulty.getByRole('button', { name: '상', exact: true }).click()
  await personality.getByRole('button', { name: '까다로움', exact: true }).click()
  await expect(difficulty.getByRole('button', { name: '상', exact: true })).toHaveAttribute(
    'aria-pressed',
    'true',
  )
  await expect(preview.locator('.app-settings-difficulty [data-selected="true"]')).toHaveText('상')
  await expect(preview.locator('.app-settings-personality [data-selected="true"]')).toHaveText(
    '까다로움',
  )
  await expect
    .poll(() => thumb.evaluate((image) => parseFloat(getComputedStyle(image).left)))
    .toBeGreaterThan(initial + 300)
  const friendly = personality.getByRole('button', { name: '친절', exact: true })
  await friendly.focus()
  await friendly.press('Enter')
  await expect(preview.locator('.app-settings-personality [data-selected="true"]')).toHaveText(
    '친절',
  )
  await expect(preview.locator('.app-settings-difficulty [data-selected="true"]')).toHaveText('상')
  await expect(preview.getByRole('status')).toHaveText('난이도 상, 상대의 태도 친절 선택됨')
  expect(apiRequests).toEqual([])
})

test('switches between the three Figma script modes on the same moving phone and preserves the choice', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1280, height: 900 })
  await page.goto('/')
  await expect(page.locator('.brand-page')).toHaveAttribute('data-brand-ready', 'true')
  await page.getByRole('tab', { name: 'AI 통화 연습', exact: true }).click()
  await expect
    .poll(() =>
      page
        .locator('#experience')
        .evaluate((element) =>
          Number((element as HTMLElement).style.getPropertyValue('--tour-progress')),
        ),
    )
    .toBeCloseTo(0.5, 2)
  const options = page.getByRole('group', { name: '통화 도움 방식', exact: true })
  const script = page.locator('.brand-tour-screen[data-current="true"] .app-call-script')
  await expect(script).toHaveAttribute('data-figma-node', '6097:6878')
  await options.getByRole('button', { name: '추천 문장', exact: true }).click()
  await expect(script).toHaveAttribute('data-figma-node', '6097:6850')
  await expect(script).toContainText('추천 : 그러면 (메뉴명)으로 주문하겠습니다.')
  await expect(page.locator('[data-tour-callout]')).toContainText(
    '다음 한마디가 어렵다면 문장을 참고해요.',
  )
  await options.getByRole('button', { name: '힌트 없이', exact: true }).click()
  await expect(script).toHaveAttribute('data-figma-node', '6097:6825')
  await expect(script.locator('.app-call-hint')).toHaveCount(0)
  await page.getByRole('tab', { name: '돌아보기', exact: true }).click()
  await page.getByRole('tab', { name: 'AI 통화 연습', exact: true }).click()
  await expect(options.getByRole('button', { name: '힌트 없이', exact: true })).toHaveAttribute(
    'aria-pressed',
    'true',
  )
  await expect
    .poll(() =>
      page
        .locator('#experience')
        .evaluate((element) =>
          Number((element as HTMLElement).style.getPropertyValue('--tour-progress')),
        ),
    )
    .toBeCloseTo(0.5, 2)
  await page.getByRole('tab', { name: 'AI 통화 연습', exact: true }).click()
  await options.getByRole('button', { name: '조언', exact: true }).click()
  await expect(script).toHaveAttribute('data-figma-node', '6097:6878')
  await expect(page.locator('[data-tour-device]')).toHaveCount(1)
})

test('keeps the settings preview readable and every static asset local at its original dimensions', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  for (const [width, height] of [
    [320, 900],
    [390, 900],
    [768, 900],
    [1024, 900],
    [1440, 900],
    [1280, 720],
  ]) {
    await page.setViewportSize({ width, height })
    await page.goto('/#practice')
    await expect(page.locator('.brand-page')).toHaveAttribute('data-brand-ready', 'true')
    const preview = page.locator('#practice')
    await expect(preview.locator('[data-practice-phone]')).toHaveCSS('transform', 'none')
    await expect(preview.locator('.app-screen')).toHaveCSS('width', '402px')
    await expect(preview.locator('.app-screen')).toHaveCSS('height', '874px')
    await expect
      .poll(() =>
        preview
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
    const geometry = await preview.locator('img').evaluateAll((images) =>
      images.map((image) => {
        const img = image as HTMLImageElement
        const style = getComputedStyle(img)
        return {
          src: img.currentSrc,
          width: parseFloat(style.width),
          height: parseFloat(style.height),
          naturalWidth: img.naturalWidth,
          naturalHeight: img.naturalHeight,
        }
      }),
    )
    for (const asset of geometry) {
      expect(
        asset.src.startsWith('data:image/') ||
          new URL(asset.src).origin === 'http://127.0.0.1:4173',
      ).toBe(true)
      expect(asset.width).toBeCloseTo(asset.naturalWidth, 0)
      expect(asset.height).toBeCloseTo(asset.naturalHeight, 0)
    }
    const phone = (await preview.locator('[data-practice-phone]').boundingBox())!
    expect(phone.x).toBeGreaterThanOrEqual(0)
    expect(phone.x + phone.width).toBeLessThanOrEqual(width)
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(width)
  }
})
