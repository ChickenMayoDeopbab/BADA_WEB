import { expect, test, type Page } from '@playwright/test'

/** 숨겨진 input 대신 사용자가 누르는 응답 라벨을 선택합니다. */
const chooseAnswer = async (page: Page, name: string) => {
  await page
    .locator('label')
    .filter({ has: page.getByRole('radio', { name, exact: true }) })
    .click()
}

test('completes the landing check even when all APIs require authentication, without sending answers', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 })
  const apiRequests: string[] = []
  await page.route(
    (url) => url.pathname.startsWith('/api/'),
    (route) => {
      apiRequests.push(route.request().url())
      return route.fulfill({ status: 401, json: { message: '인증이 필요합니다.' } })
    },
  )
  await page.goto('/#diagnosis')
  const start = page.getByRole('button', { name: '자가진단 시작하기', exact: true })
  await start.click()
  await expect(page.getByRole('dialog')).toHaveCount(0)
  await expect(page.getByRole('button', { name: '다음 문항', exact: true })).toBeDisabled()
  await chooseAnswer(page, '2점')
  await page.getByRole('button', { name: '다음 문항', exact: true }).click()
  await chooseAnswer(page, '자주 있다')
  await page.getByRole('button', { name: '이전 문항으로', exact: true }).click()
  await expect(page.getByRole('radio', { name: '2점', exact: true })).toBeChecked()
  await page.getByRole('button', { name: '다음 문항', exact: true }).click()
  await expect(page.getByRole('radio', { name: '자주 있다', exact: true })).toBeChecked()
  await page.getByRole('button', { name: '다음 문항', exact: true }).click()
  for (let index = 2; index < 5; index++) {
    await chooseAnswer(page, '보통이다')
    await page
      .getByRole('button', { name: index === 4 ? '결과 확인하기' : '다음 문항', exact: true })
      .click()
  }
  await expect(page.getByRole('heading', { name: '조금 부담스러워요', exact: true })).toBeVisible()
  await page.getByRole('button', { name: '레벨 설명 보기', exact: true }).focus()
  await expect(page.getByRole('tooltip')).toContainText('상황에 따라 전화가 망설여지는')
  const resultLine = page.locator('.landing-diagnosis-result-line')
  await expect(resultLine).toHaveJSProperty('naturalWidth', 240)
  await expect(resultLine).toHaveCSS('width', '240px')
  await expect(resultLine).toHaveCSS('height', '2px')
  expect(apiRequests).toEqual([])
  await expect(page).toHaveURL(/\/#diagnosis$/)
  await page.getByRole('button', { name: '다시 해보기', exact: true }).click()
  await expect(start).toBeVisible()
  await start.click()
  await expect(page.getByRole('radio', { name: '2점', exact: true })).not.toBeChecked()
})

test('finishes the landing check offline and does not persist answers across reloads', async ({
  page,
  context,
}) => {
  await page.goto('/#diagnosis')
  await expect(page.locator('.brand-page')).toHaveAttribute('data-brand-ready', 'true')
  await context.setOffline(true)
  await page.getByRole('button', { name: '자가진단 시작하기', exact: true }).click()
  for (let index = 0; index < 5; index++) {
    await chooseAnswer(page, '전혀 없다')
    await page
      .getByRole('button', { name: index === 4 ? '결과 확인하기' : '다음 문항', exact: true })
      .click()
  }
  await expect(page.getByRole('heading', { name: '가벼운 편이에요', exact: true })).toBeVisible()
  await expect(page.getByRole('alert')).toHaveCount(0)
  await context.setOffline(false)
  await page.reload()
  await expect(page.getByRole('button', { name: '자가진단 시작하기', exact: true })).toBeVisible()
  await expect(page.getByRole('heading', { name: '가벼운 편이에요', exact: true })).toHaveCount(0)
})

test('keeps the diagnosis section and following content steady across all questions and result lengths', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  for (const width of [320, 390, 768, 1280]) {
    await page.setViewportSize({ width, height: 900 })
    await page.goto('/#diagnosis')
    const section = page.locator('#diagnosis')
    await expect(page.getByRole('button', { name: '자가진단 시작하기', exact: true })).toBeVisible()
    const initial = await section.evaluate((element) => ({
      height: element.getBoundingClientRect().height,
      nextTop: document.getElementById('faq')!.offsetTop,
    }))
    for (const answer of ['전혀 없다', '보통이다', '자주 있다']) {
      await page.getByRole('button', { name: '자가진단 시작하기', exact: true }).click()
      for (let index = 0; index < 5; index++) {
        const layout = await section.evaluate((element) => ({
          height: element.getBoundingClientRect().height,
          nextTop: document.getElementById('faq')!.offsetTop,
        }))
        expect(layout.height).toBeCloseTo(initial.height, 0)
        expect(layout.nextTop).toBe(initial.nextTop)
        await chooseAnswer(page, answer)
        await page
          .getByRole('button', { name: index === 4 ? '결과 확인하기' : '다음 문항', exact: true })
          .click()
      }
      await expect(page.locator('.landing-diagnosis-result')).toBeVisible()
      const resultLayout = await section.evaluate((element) => ({
        height: element.getBoundingClientRect().height,
        nextTop: document.getElementById('faq')!.offsetTop,
      }))
      expect(resultLayout.height).toBeCloseTo(initial.height, 0)
      expect(resultLayout.nextTop).toBe(initial.nextTop)
      await page.getByRole('button', { name: '다시 해보기', exact: true }).click()
    }
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(width)
  }
})
