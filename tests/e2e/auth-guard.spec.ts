import { expect, test } from '@playwright/test'
import { authenticate } from './authFixture'

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
  await page.route('**/api/v1/auth/signout', (route) => route.fulfill({ json: { status: 200 } }))
  await page.goto('/notifications?first=1')
  await expect(page.getByRole('heading', { name: '알림 화면' })).toBeVisible()
  await page.goto('/notifications?second=1')
  await page.getByRole('link', { name: '로그아웃', exact: true }).click()
  await expect(page).toHaveURL(/\/$/)
  await page.goBack()
  await expect(page).toHaveURL(/\/$/)
  await expect(page.getByRole('heading', { name: '알림 화면' })).toHaveCount(0)
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
  await page.goto('/notifications')
  await expect(page.getByRole('heading', { name: '알림 화면' })).toBeVisible()
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
  await page.goto('/notifications')
  await expect(page.getByRole('heading', { name: '알림 화면' })).toBeVisible()
  await page.evaluate(() => {
    localStorage.removeItem('bada.accessToken')
    localStorage.removeItem('bada.refreshToken')
  })
  await page.getByRole('link', { name: '마이페이지', exact: true }).click()
  await expect(page).toHaveURL(/\/$/)
  await expect(page.getByRole('navigation', { name: '주요 메뉴' })).toHaveCount(0)
})
