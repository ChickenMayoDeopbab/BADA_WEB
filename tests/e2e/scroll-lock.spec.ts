import { expect, test, type Locator, type Page } from '@playwright/test'

/** 스크롤이 필요한 프로필과 긴 시나리오를 실제 조회 계약으로 제공합니다. */
const prepare = async (page: Page) => {
  const scenario = {
    scenario_id: 1,
    title: '긴 예약 훈련',
    content: '예약 날짜와 인원을 확인합니다.\n'.repeat(60),
    category: 'daily',
    is_custom: true,
    practice_count: 0,
  }
  await page.addInitScript(() => localStorage.setItem('bada.accessToken', 'scroll-test-token'))
  await page.route('**/api/v1/**', async (route) => {
    const path = new URL(route.request().url()).pathname
    if (path.endsWith('/scenario/scenarios'))
      return route.fulfill({
        json: {
          scenarios: Array.from({ length: 12 }, (_, index) => ({
            ...scenario,
            scenario_id: index + 1,
            title: `긴 예약 훈련 ${index + 1}`,
          })),
        },
      })
    if (path.endsWith('/scenario/recommendation')) return route.fulfill({ json: { scenario } })
    if (path.endsWith('/example')) return route.fulfill({ json: { dialogue: [] } })
    if (path.endsWith('/users/me') || path.endsWith('/user/mypage'))
      return route.fulfill({
        json: {
          data: { name: '사용자', username: 'bada', email: 'bada@example.com', trainCount: 0 },
        },
      })
    if (path.endsWith('/training-records'))
      return route.fulfill({ json: { data: { content: [], totalElements: 0, totalPages: 0 } } })
    if (path.endsWith('/notifications/settings'))
      return route.fulfill({
        json: { data: { allEnabled: true, trainingEnabled: true, communityEnabled: true } },
      })
    return route.fulfill({ json: { data: null } })
  })
}

/** 브라우저가 실제 휠 입력을 처리한 뒤 위치를 비교합니다. */
const wheelOver = async (page: Page, target: Locator, delta: number) => {
  await target.hover()
  await page.mouse.wheel(0, delta)
  await page.waitForTimeout(150)
}

test('prevents wheel chaining from a non-scrollable in-page dialog and restores background scrolling', async ({
  page,
}) => {
  await prepare(page)
  await page.setViewportSize({ width: 1280, height: 600 })
  await page.goto('/profile')
  const background = page.locator('[data-scroll-lock-target]')
  await page.getByRole('button', { name: '회원 탈퇴', exact: true }).scrollIntoViewIfNeeded()
  const contentWidth = (await page.locator('main').boundingBox())!.width
  await page.getByRole('button', { name: '회원 탈퇴', exact: true }).click()
  const dialog = page.getByRole('dialog', { name: '정말 회원 탈퇴할까요?' })
  await expect(dialog).toBeVisible()
  const before = await background.evaluate((element) => element.scrollTop)
  expect(before).toBeGreaterThan(0)
  const width = (await background.boundingBox())!.width
  expect((await page.locator('main').boundingBox())!.width).toBe(contentWidth)
  await wheelOver(page, dialog.getByRole('heading'), -400)
  expect(await background.evaluate((element) => element.scrollTop)).toBe(before)
  await expect(background).toHaveCSS('overflow-y', 'hidden')
  await dialog.getByRole('button', { name: '취소', exact: true }).click()
  await expect(background).toHaveCSS('overflow-y', 'auto')
  expect((await background.boundingBox())!.width).toBe(width)
  expect((await page.locator('main').boundingBox())!.width).toBe(contentWidth)
  await wheelOver(page, page.getByRole('button', { name: '회원 탈퇴', exact: true }), -400)
  await expect.poll(() => background.evaluate((element) => element.scrollTop)).toBeLessThan(before)
})

test('allows drawer scrolling, blocks chaining at its boundary and keeps the lock through a nested native dialog', async ({
  page,
}) => {
  await prepare(page)
  await page.setViewportSize({ width: 1280, height: 700 })
  await page.goto('/training')
  await page.getByRole('tab', { name: '커스텀', exact: true }).click()
  await page.getByRole('button', { name: '긴 예약 훈련 12 상세 보기', exact: true }).click()
  const background = page.locator('[data-scroll-lock-target]')
  const before = await background.evaluate((element) => element.scrollTop)
  expect(before).toBeGreaterThan(0)
  const drawer = page.getByRole('dialog', { name: '긴 예약 훈련 12 상세', exact: true })
  const content = drawer.locator('.overflow-y-auto')
  await wheelOver(page, content, 300)
  await expect.poll(() => content.evaluate((element) => element.scrollTop)).toBeGreaterThan(0)
  await content.evaluate((element) => {
    element.scrollTop = 0
  })
  await wheelOver(page, content, -600)
  expect(await background.evaluate((element) => element.scrollTop)).toBe(before)
  await content.evaluate((element) => {
    element.scrollTop = element.scrollHeight
  })
  await wheelOver(page, content, 600)
  expect(await background.evaluate((element) => element.scrollTop)).toBe(before)
  await drawer.getByRole('button', { name: '시나리오 메뉴 열기' }).click()
  await drawer.getByRole('button', { name: '시나리오 삭제하기' }).click()
  const confirmation = page.getByRole('dialog', { name: '긴 예약 훈련 12 시나리오를 삭제할까요?' })
  await wheelOver(page, confirmation.getByRole('heading'), -600)
  expect(await background.evaluate((element) => element.scrollTop)).toBe(before)
  await confirmation.getByRole('button', { name: '취소', exact: true }).click()
  await expect(background).toHaveCSS('overflow-y', 'hidden')
  await drawer.getByRole('button', { name: '시나리오 상세 닫기' }).click()
  await expect(background).toHaveCSS('overflow-y', 'auto')
  expect(await background.evaluate((element) => element.scrollTop)).toBe(before)
})

test('blocks native touch scrolling of the background while the mobile withdrawal dialog is open', async ({
  page,
}) => {
  await prepare(page)
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto('/profile')
  await page.getByRole('button', { name: '회원 탈퇴', exact: true }).click()
  const background = page.locator('[data-scroll-lock-target]')
  const before = await background.evaluate((element) => element.scrollTop)
  const dialog = page.getByRole('dialog', { name: '정말 회원 탈퇴할까요?' })
  const bounds = (await dialog.boundingBox())!
  const session = await page.context().newCDPSession(page)
  await session.send('Input.synthesizeScrollGesture', {
    x: bounds.x + bounds.width / 2,
    y: bounds.y + bounds.height / 2,
    yDistance: 250,
    gestureSourceType: 'touch',
  })
  expect(await background.evaluate((element) => element.scrollTop)).toBe(before)
  await dialog.getByRole('button', { name: '취소', exact: true }).click()
  await session.send('Input.synthesizeScrollGesture', {
    x: 195,
    y: 400,
    yDistance: 250,
    gestureSourceType: 'touch',
  })
  await expect.poll(() => background.evaluate((element) => element.scrollTop)).toBeLessThan(before)
  await session.detach()
})
