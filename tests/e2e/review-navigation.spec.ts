import { expect, test, type Page } from '@playwright/test'
import { authenticate } from './authFixture'

/** 인증과 빈 알림·프로필 응답으로 화면 이동만 검증합니다. */
const prepare = async (page: Page) => {
  await page.route('**/api/v1/**', (route) => route.fulfill({ json: { data: null } }))
  await authenticate(page)
  await page.route('**/api/v1/notifications?*', (route) =>
    route.fulfill({
      json: { data: { unreadCount: 0, notifications: { content: [], number: 0, last: true } } },
    }),
  )
}

test('shows a verified 404 with a dashboard action while guests still return to landing', async ({
  page,
}) => {
  await prepare(page)
  await page.goto('/broken-link')
  await expect(page.getByRole('heading', { name: '페이지를 찾을 수 없습니다.' })).toBeVisible()
  await expect(page.getByRole('link', { name: '대시보드로 이동' })).toHaveAttribute(
    'href',
    '/dashboard',
  )
  await page.evaluate(() => {
    localStorage.removeItem('bada.accessToken')
    localStorage.removeItem('bada.refreshToken')
  })
  await page.goto('/another-broken-link')
  await expect(page).toHaveURL(/\/$/)
  await expect(page.getByRole('heading', { name: '페이지를 찾을 수 없습니다.' })).toHaveCount(0)
})

test('returns direct notification visits to dashboard and in-app visits to their previous screen', async ({
  page,
}) => {
  await prepare(page)
  await page.goto('/notifications')
  await page.getByRole('button', { name: '이전 화면으로' }).click()
  await expect(page).toHaveURL(/\/dashboard$/)
  await page.goto('/profile')
  await page.getByRole('link', { name: '알림', exact: true }).click()
  await expect(page).toHaveURL(/\/notifications$/)
  await page.getByRole('button', { name: '이전 화면으로' }).click()
  await expect(page).toHaveURL(/\/profile$/)
})
