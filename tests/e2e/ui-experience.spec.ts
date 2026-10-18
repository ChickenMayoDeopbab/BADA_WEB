import { expect, test, type Page } from '@playwright/test'
import { makeWeeklyOverview } from './weeklyDashboardFixture'

const scenario = {
  scenario_id: 1,
  title: '예약하기',
  content: '일정을 예약합니다.',
  category: 'daily',
  is_custom: false,
  practice_count: 0,
}
const record = {
  recordId: 1,
  sessionId: 'test',
  trainedAt: new Date().toISOString(),
  scenarioId: 1,
  scenarioName: '예약하기',
  sessionType: 'SCENARIO',
  durationSeconds: 120,
  anxietyScore: 3,
  positiveFeedbacks: [],
}
const profile = {
  name: '사용자',
  username: 'bada',
  email: 'bada@example.com',
  trainCount: 1,
  levelName: '초급',
  attendance: 0,
}
const post = {
  post_id: 9,
  title: '전화 훈련 경험',
  content: '편안하게 연습했어요.',
  author: { user_id: 42, name: '작성자', profile_image_url: null },
  view_count: 1,
  comment_count: 0,
  reactions: { cheer: 0, relate: 0, like: 0 },
  my_reaction: null,
  created_at: new Date().toISOString(),
  attachments: [],
}

/** 각 페이지의 실제 API 계약을 응답하고 필요한 요청만 테스트에서 제어합니다. */
const prepare = async (page: Page) => {
  await page.addInitScript(() => localStorage.setItem('bada.accessToken', 'ui-test-token'))
  await page.route('**/api/v1/**', async (route) => {
    const path = new URL(route.request().url()).pathname
    if (path.endsWith('/scenario/scenarios'))
      return route.fulfill({
        json: {
          scenarios: Array.from({ length: 12 }, (_, i) => ({
            ...scenario,
            scenario_id: i + 1,
            title: `예약하기 ${i + 1}`,
          })),
        },
      })
    if (path.endsWith('/scenario/recommendation')) return route.fulfill({ json: { scenario } })
    if (path.includes('/scenario/') && path.endsWith('/example'))
      return route.fulfill({ json: { dialogue: [] } })
    if (path.endsWith('/training-call-schedules/ringing'))
      return route.fulfill({ json: { data: null } })
    if (path.endsWith('/community/posts/9')) return route.fulfill({ json: post })
    if (path.endsWith('/comments')) return route.fulfill({ json: { comments: [] } })
    if (path.endsWith('/posts'))
      return route.fulfill({ json: { posts: [], total: 0, page: 1, size: 50 } })
    if (path.endsWith('/training-records/1')) return route.fulfill({ json: { data: record } })
    if (path.endsWith('/training-records'))
      return route.fulfill({
        json: { data: { content: [record], totalElements: 1, totalPages: 1 } },
      })
    if (path.endsWith('/attendance')) return route.fulfill({ json: { data: [] } })
    if (path.endsWith('/users/me') || path.endsWith('/user/mypage'))
      return route.fulfill({ json: { data: profile } })
    if (path.endsWith('/notifications/settings'))
      return route.fulfill({
        json: { data: { trainingEnabled: true, communityEnabled: true, allEnabled: true } },
      })
    if (path.endsWith('/dashboard/overview')) {
      const params = new URL(route.request().url()).searchParams
      return route.fulfill({
        json: { data: makeWeeklyOverview(params.get('from')!, params.get('to')!) },
      })
    }
    if (path.endsWith('/dashboard/weekly-summary'))
      return route.fulfill({
        json: {
          data: {
            trainingCount: 1,
            totalCallDurationSeconds: 120,
            comment: '이번 주에도 연습했어요.',
          },
        },
      })
    if (path.endsWith('/dashboard/metrics'))
      return route.fulfill({
        json: {
          data: {
            weekStart: new Date().toISOString().slice(0, 10),
            weekEnd: new Date().toISOString().slice(0, 10),
            dates: [],
            stabilityScores: [],
            conversationScores: [],
            fluencyScores: [],
          },
        },
      })
    if (path.endsWith('/legal-consents/status'))
      return route.fulfill({
        json: { data: { profileImageAgreed: true, sensitiveInformationAgreed: true } },
      })
    return route.fulfill({ json: { data: {} } })
  })
}

/** 시간 지연 대신 테스트가 실제 응답의 완료 시점을 결정합니다. */
const deferred = () => {
  let release!: () => void
  const promise = new Promise<void>((resolve) => {
    release = resolve
  })
  return { promise, release }
}

test('shows skeletons until the real response, then empty state; errors can be retried', async ({
  page,
}) => {
  await prepare(page)
  const gate = deferred()
  let shouldFail = false
  await page.route('**/api/v1/training-records?*', async (route) => {
    await gate.promise
    return shouldFail
      ? route.fulfill({ status: 503, json: { message: '기록 조회 오류' } })
      : route.fulfill({ json: { data: { content: [], totalElements: 0, totalPages: 0 } } })
  })
  try {
    await page.goto('/records')
    await expect(page.getByRole('status', { name: '훈련 기록을 불러오는 중' })).toBeVisible()
    await expect(page.getByText('0회', { exact: true })).toHaveCount(0)
    gate.release()
    await expect(page.getByRole('status', { name: '훈련 기록을 불러오는 중' })).toHaveCount(0)
    await expect(page.getByText('해당 기간의 훈련 기록이 없습니다.')).toBeVisible()
    shouldFail = true
    await page.reload()
    await expect(page.getByRole('alert')).toContainText('기록 조회 오류')
    shouldFail = false
    await page.getByRole('button', { name: '다시 불러오기' }).click()
    await expect(page.getByText('해당 기간의 훈련 기록이 없습니다.')).toBeVisible()
  } finally {
    gate.release()
  }
})

test('centres the own-post empty state vertically', async ({ page }) => {
  await prepare(page)
  await page.setViewportSize({ width: 1280, height: 800 })
  await page.goto('/community')
  await page.getByRole('tab', { name: '내 글' }).click()
  const state = page.getByRole('status').filter({ hasText: '아직 작성한 글이 없어요.' })
  await expect(state).toBeVisible()
  const bounds = await state.boundingBox()
  const area = await state.locator('..').boundingBox()
  expect(area!.height).toBeGreaterThan(400)
  expect(Math.abs(bounds!.y + bounds!.height / 2 - area!.y - area!.height / 2)).toBeLessThan(2)
  await page.screenshot({ path: 'test-results/community-empty-centred.png' })
})

test('keeps the page stationary while the scenario drawer opens, with a clear backdrop and native scrolling', async ({
  page,
}) => {
  await prepare(page)
  await page.setViewportSize({ width: 1280, height: 800 })
  await page.goto('/training')
  const target = page.getByRole('button', { name: '예약하기 12 상세 보기', exact: true })
  await target.scrollIntoViewIfNeeded()
  const main = page.locator('main')
  const before = await main.boundingBox()
  await target.click()
  const drawer = page.getByRole('dialog', { name: '예약하기 12 상세' })
  await expect(drawer).toBeVisible()
  await expect.poll(async () => (await drawer.boundingBox())!.x).toBe(724)
  const bounds = await drawer.boundingBox()
  expect(bounds!.y).toBe(16)
  expect(bounds!.height).toBe(768)
  const after = await main.boundingBox()
  expect(after!.x).toBe(before!.x)
  expect(after!.y).toBe(before!.y)
  await expect(page.getByRole('button', { name: '시나리오 상세 닫기' }).first()).toHaveCSS(
    'background-color',
    'rgba(0, 0, 0, 0)',
  )
  expect(
    await drawer
      .locator('img.object-cover')
      .first()
      .evaluate((element) => (element as HTMLImageElement).draggable),
  ).toBe(false)
  await page.screenshot({ path: 'test-results/scenario-drawer-stationary.png' })
  await page.keyboard.press('Escape')
  await expect(drawer).toHaveCount(0)
  await expect(target).toBeFocused()
})

test('covers the whole viewport with calendar blur and keeps record detail stationary', async ({
  page,
}) => {
  await prepare(page)
  await page.setViewportSize({ width: 1280, height: 800 })
  await page.goto('/records')
  await page.locator('button[aria-haspopup="dialog"]').click()
  const backdrop = page.getByRole('button', { name: '날짜 선택 취소' })
  expect(await backdrop.boundingBox()).toEqual({ x: 0, y: 0, width: 1280, height: 800 })
  await expect(backdrop).toHaveCSS('backdrop-filter', 'blur(2px)')
  await page.screenshot({ path: 'test-results/calendar-viewport-blur.png' })
  await page.keyboard.press('Escape')
  await expect(page.getByRole('dialog')).toHaveCount(0)
  await page.getByRole('button', { name: '예약하기 기록 상세 보기' }).click()
  const drawer = page.getByRole('dialog', { name: '훈련 기록 상세' })
  await expect(drawer).toBeVisible()
  await expect.poll(async () => (await drawer.boundingBox())!.x).toBe(724)
  await expect(page.getByRole('button', { name: '훈련 기록 상세 닫기' }).first()).toHaveCSS(
    'background-color',
    'rgba(0, 0, 0, 0)',
  )
})

test('uses a plain back button, keyboard menus and report dialogs without entry animation', async ({
  page,
}) => {
  await prepare(page)
  await page.goto('/community/9')
  const back = page.getByRole('button', { name: '전체 글', exact: true })
  await expect(back).toHaveCSS('background-color', 'rgba(0, 0, 0, 0)')
  await expect(back.locator('span')).toHaveCSS('background-color', 'rgba(0, 0, 0, 0)')
  await back.hover()
  await expect(back).toHaveCSS('background-color', 'rgb(248, 248, 248)')
  const trigger = page.getByRole('button', { name: '@작성자 게시글 메뉴' })
  await trigger.focus()
  await page.keyboard.press('ArrowDown')
  const report = page.getByRole('menuitem', { name: '게시글 신고하기' })
  await expect(report).toBeFocused()
  await page.keyboard.press('Enter')
  const dialog = page.getByRole('dialog', { name: '게시글 신고하기' })
  await expect(dialog).toBeVisible()
  await expect(dialog).toHaveCSS('animation-name', 'none')
  await expect(page.locator('.ux-page')).toHaveCSS('animation-name', 'none')
  await page.keyboard.press('Escape')
  await expect(dialog).toHaveCount(0)
  await expect(trigger).toBeFocused()
})

test('locks notification actions during the real write and only toasts after success', async ({
  page,
}) => {
  await prepare(page)
  const gate = deferred()
  let shouldFail = true
  await page.route('**/api/v1/notifications/settings', async (route) => {
    if (route.request().method() !== 'PUT') return route.fallback()
    if (shouldFail) return route.fulfill({ status: 503, json: { message: '알림 저장 오류' } })
    await gate.promise
    return route.fulfill({ json: { data: route.request().postDataJSON() } })
  })
  try {
    await page.goto('/profile/notifications')
    const toggle = page.getByRole('button', { name: /전체 알림/ })
    await toggle.click()
    await expect(page.getByRole('alert')).toContainText('알림 설정을 저장하지 못했습니다.')
    await expect(page.getByText('알림 설정을 저장했어요.')).toHaveCount(0)
    shouldFail = false
    await toggle.click()
    await expect(toggle).toBeDisabled()
    await expect(page.getByText('알림 설정을 저장했어요.')).toHaveCount(0)
    gate.release()
    await expect(page.getByRole('status')).toHaveText('알림 설정을 저장했어요.')
    await expect(toggle).toBeEnabled()
    await page.getByRole('button', { name: '알림 닫기' }).click()
    await expect(page.getByText('알림 설정을 저장했어요.')).toHaveCount(0)
  } finally {
    gate.release()
  }
})

test('keeps core screens within mobile width and respects reduced motion without losing keyboard tabs', async ({
  page,
}) => {
  await prepare(page)
  await page.setViewportSize({ width: 390, height: 844 })
  const errors: string[] = []
  page.on('pageerror', (error) => errors.push(error.message))
  for (const path of [
    '/dashboard',
    '/training',
    '/records',
    '/community',
    '/community/9',
    '/profile',
    '/profile/edit',
    '/profile/privacy',
    '/profile/notifications',
    '/login',
    '/signup',
    '/find-id',
    '/reset-password',
  ]) {
    await page.goto(path)
    const main = page.locator('main')
    await expect(main).toBeVisible()
    await expect
      .poll(() => main.evaluate((element) => element.scrollWidth - element.clientWidth))
      .toBeLessThanOrEqual(1)
    await page.screenshot({ path: `test-results/mobile-${path.replaceAll('/', '-')}.png` })
  }
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.goto('/training')
  const first = page.getByRole('tab', { name: '기본 제공' })
  await first.focus()
  await page.keyboard.press('ArrowRight')
  await expect(page.getByRole('tab', { name: '커스텀' })).toBeFocused()
  await expect(page.getByRole('tab', { name: '커스텀' })).toHaveAttribute('aria-selected', 'true')
  await expect(first).toHaveCSS('transition-duration', '0s')
  expect(errors).toEqual([])
})

/** 장애 화면은 서버/코드 오류의 상세 내용을 사용자에게 노출하지 않습니다. */
test('offers recovery instead of exposing a rendering stack trace', async ({ page }) => {
  await prepare(page)
  await page.route('**/api/v1/dashboard/overview?*', (route) =>
    route.fulfill({ json: { data: {} } }),
  )
  await page.goto('/dashboard')
  await expect(page.getByRole('alert')).toContainText('화면을 불러오지 못했어요.')
  await expect(page.getByText('Unexpected Application Error!')).toHaveCount(0)
  await expect(page.getByRole('button', { name: '다시 시도하기' })).toBeVisible()
  await page.getByRole('link', { name: '홈으로 돌아가기' }).click()
  await expect(page).toHaveURL(/\/$/)
  await expect(page.getByRole('heading', { name: '전화가 편해지는 연습, Bada' })).toBeVisible()
})
