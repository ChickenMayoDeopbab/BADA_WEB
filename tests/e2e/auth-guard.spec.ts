import { expect, test } from '@playwright/test'
import { authenticate } from './authFixture'

test('stored tokens do not trigger session verification on public routes, but protected routes still verify', async ({
  page,
}) => {
  await authenticate(page)
  let verificationRequests = 0
  await page.route('**/api/v1/user/mypage', (route) => {
    verificationRequests++
    return route.fulfill({
      json: { data: { username: 'bada', name: '바다', email: 'bada@example.test' } },
    })
  })
  await page.route('**/api/v1/notifications?*', (route) =>
    route.fulfill({
      json: { data: { notifications: { content: [], number: 0, last: true }, unreadCount: 0 } },
    }),
  )
  for (const path of ['/', '/login', '/signup', '/find-id', '/reset-password']) {
    await page.goto(path)
    await expect(page.locator('main')).toBeVisible()
  }
  expect(verificationRequests).toBe(0)
  await page.goto('/notifications')
  await expect(page.getByRole('heading', { name: '알림', exact: true })).toBeVisible()
  expect(verificationRequests).toBeGreaterThan(0)
})

test('stored tokens cannot render service content or load its data before server verification completes', async ({
  page,
}) => {
  await authenticate(page)
  let finishVerification!: () => void
  const verification = new Promise<void>((resolve) => {
    finishVerification = resolve
  })
  let verificationStarted = false
  let recordRequests = 0
  await page.route('**/api/v1/user/mypage', async (route) => {
    verificationStarted = true
    await verification
    await route.fulfill({
      json: { data: { username: 'bada', name: '바다', email: 'bada@example.test' } },
    })
  })
  await page.route('**/api/v1/training-records**', (route) => {
    recordRequests += 1
    return route.fulfill({
      json: { data: { totalPages: 0, totalElements: 0, number: 0, content: [] } },
    })
  })
  await page.goto('/records')
  await expect.poll(() => verificationStarted).toBe(true)
  await expect(page.getByRole('navigation', { name: '주요 메뉴' })).toHaveCount(0)
  await expect(page.getByRole('heading', { name: '훈련 기록', exact: true })).toHaveCount(0)
  expect(recordRequests).toBe(0)
  finishVerification()
  await expect(page.getByRole('navigation', { name: '주요 메뉴' })).toBeVisible()
  await expect.poll(() => recordRequests).toBeGreaterThan(0)
})

test('rejected credentials silently redirect to landing without ever mounting protected content', async ({
  page,
}) => {
  await authenticate(page)
  await page.addInitScript(() => {
    new MutationObserver(() => {
      if (document.querySelector('nav[aria-label="주요 메뉴"]'))
        document.documentElement.dataset.privateContentRendered = 'true'
    }).observe(document, { childList: true, subtree: true })
  })
  let recordRequests = 0
  await page.route('**/api/v1/user/mypage', (route) =>
    route.fulfill({ status: 401, json: { message: '인증이 필요합니다.' } }),
  )
  await page.route('**/api/v1/training-records**', (route) => {
    recordRequests += 1
    return route.abort()
  })
  await page.goto('/records')
  await expect(page).toHaveURL(/\/$/)
  await expect(page.getByRole('heading', { name: '랜딩 페이지' })).toBeVisible()
  await expect(page.getByText('인증이 필요합니다.')).toHaveCount(0)
  expect(
    await page.evaluate(() => document.documentElement.dataset.privateContentRendered),
  ).toBeUndefined()
  expect(recordRequests).toBe(0)
  expect(await page.evaluate(() => localStorage.getItem('bada.accessToken'))).toBeNull()
})

test('guests always return to landing from protected and unknown URLs', async ({ page }) => {
  const protectedRequests: string[] = []
  await page.route('**/api/v1/**', (route) => {
    protectedRequests.push(route.request().url())
    return route.abort()
  })
  for (const path of [
    '/dashboard',
    '/training',
    '/records',
    '/community/11',
    '/profile',
    '/profile/ringtone',
    '/notifications',
    '/welcome',
    '/training/1/call',
    '/training/1/result',
    '/unknown',
  ]) {
    await page.goto(path)
    await expect(page).toHaveURL(/\/$/)
    await expect(page.getByRole('heading', { name: '랜딩 페이지' })).toBeVisible()
    await expect(page.getByRole('navigation', { name: '주요 메뉴' })).toHaveCount(0)
  }
  expect(protectedRequests).toEqual([])
})

test('login and account recovery routes remain available without a token', async ({ page }) => {
  for (const path of [
    '/login',
    '/signup',
    '/find-id',
    '/reset-password',
    '/oauth/callback?error=access_denied',
  ]) {
    await page.goto(path)
    await expect(page).toHaveURL(new RegExp(path.split('?')[0]))
    await expect(page.getByRole('heading', { name: '랜딩 페이지' })).toHaveCount(0)
  }
})

test('logout prevents history navigation, direct URL access and reload from reopening protected content', async ({
  page,
}) => {
  await authenticate(page)
  await page.route('**/api/v1/**', (route) => route.fulfill({ json: { data: {} } }))
  await page.route('**/api/v1/notifications?*', (route) =>
    route.fulfill({
      json: { data: { notifications: { content: [], number: 0, last: true }, unreadCount: 0 } },
    }),
  )
  await page.route('**/api/v1/auth/signout', (route) => route.fulfill({ json: { status: 200 } }))
  await page.goto('/notifications?first=1')
  await expect(page.getByRole('heading', { name: '알림', exact: true })).toBeVisible()
  await page.goto('/notifications?second=1')
  await page.getByRole('button', { name: '로그아웃', exact: true }).click()
  await expect(page).toHaveURL(/\/$/)
  await page.goBack()
  await expect(page).toHaveURL(/\/$/)
  await expect(page.getByRole('heading', { name: '알림', exact: true })).toHaveCount(0)
  await page.goto('/profile')
  await expect(page).toHaveURL(/\/$/)
  await page.reload()
  await expect(page.getByRole('heading', { name: '랜딩 페이지' })).toBeVisible()
  expect(
    await page.evaluate(() => [
      localStorage.getItem('bada.accessToken'),
      localStorage.getItem('bada.refreshToken'),
      sessionStorage.getItem('bada.accessToken'),
      sessionStorage.getItem('bada.refreshToken'),
    ]),
  ).toEqual([null, null, null, null])
})

test('logout in another tab removes the active protected screen', async ({ page, context }) => {
  await authenticate(page)
  await page.route('**/api/v1/**', (route) => route.fulfill({ json: { data: {} } }))
  await page.route('**/api/v1/notifications?*', (route) =>
    route.fulfill({
      json: { data: { notifications: { content: [], number: 0, last: true }, unreadCount: 0 } },
    }),
  )
  await page.goto('/notifications')
  await expect(page.getByRole('heading', { name: '알림', exact: true })).toBeVisible()
  const otherTab = await context.newPage()
  await otherTab.goto('/')
  await otherTab.evaluate(() => {
    localStorage.removeItem('bada.accessToken')
    localStorage.removeItem('bada.refreshToken')
  })
  await expect(page).toHaveURL(/\/$/)
  await expect(page.getByRole('heading', { name: '랜딩 페이지' })).toBeVisible()
})

test('navigating after tokens are removed in the same tab returns to landing', async ({ page }) => {
  await authenticate(page)
  await page.route('**/api/v1/**', (route) => route.fulfill({ json: { data: {} } }))
  await page.route('**/api/v1/notifications?*', (route) =>
    route.fulfill({
      json: { data: { notifications: { content: [], number: 0, last: true }, unreadCount: 0 } },
    }),
  )
  await page.goto('/notifications')
  await expect(page.getByRole('heading', { name: '알림', exact: true })).toBeVisible()
  await page.evaluate(() => {
    localStorage.removeItem('bada.accessToken')
    localStorage.removeItem('bada.refreshToken')
  })
  await page.getByRole('link', { name: '마이페이지', exact: true }).click()
  await expect(page).toHaveURL(/\/$/)
  await expect(page.getByRole('navigation', { name: '주요 메뉴' })).toHaveCount(0)
})
