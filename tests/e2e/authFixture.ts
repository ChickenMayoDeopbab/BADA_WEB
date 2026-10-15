import type { Page } from '@playwright/test'

/** 첫 방문에만 테스트 세션을 만들고 로그아웃 뒤에는 토큰을 복원하지 않습니다. */
export const authenticate = async (page: Page) => {
  await page.route('**/api/v1/user/mypage', (route) =>
    route.fulfill({
      json: {
        data: { username: 'bada-test', name: '테스트 사용자', email: 'bada@example.test' },
      },
    }),
  )
  await page.addInitScript(() => {
    if (sessionStorage.getItem('bada.e2eSessionInitialized')) return
    localStorage.setItem('bada.accessToken', 'test-access-token')
    localStorage.setItem('bada.refreshToken', 'test-refresh-token')
    sessionStorage.setItem('bada.e2eSessionInitialized', 'true')
  })
}
