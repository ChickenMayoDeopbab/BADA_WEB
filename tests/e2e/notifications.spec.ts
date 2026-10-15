import { expect, test, type Page } from '@playwright/test'
import type { AppNotification } from '../../src/entities/notification'
import { authenticate } from './authFixture'

/** Figma의 목록 예시를 실제 서버 응답 형식으로 만듭니다. */
const notification = (
  id: number,
  minutes: number,
  overrides: Partial<AppNotification> = {},
): AppNotification => ({
  notificationId: id,
  type: 'POST_COMMENT',
  title: '새 댓글',
  message: '내 글에 댓글을 작성했어요.',
  actorUserId: 42,
  actorName: ['조상철', '시나리오 훈련', '이도연', '전수안', '박준석'][id - 1] ?? '사용자',
  actorProfileImage: null,
  postId: 11,
  commentId: 21,
  scheduleId: null,
  read: id > 2,
  createdAt: new Date(Date.now() - minutes * 60_000).toISOString(),
  ...overrides,
})

/** 알림 조회·읽음 요청을 계측하며 실패와 다음 페이지를 제어합니다. */
const prepareNotifications = async (page: Page, initial?: AppNotification[]) => {
  await page.route('**/api/v1/**', (route) => route.fulfill({ json: { data: {} } }))
  await authenticate(page)
  let items = initial ?? [
    notification(1, 1),
    notification(2, 3, {
      type: 'TRAINING_REMINDER',
      title: '시나리오 훈련',
      message: '3분~6분 후 시나리오 훈련이 시작돼요.',
      scheduleId: 7,
      postId: null,
    }),
    notification(3, 420, { type: 'POST_LIKE', message: '내 글에 좋아요를 눌렀어요.' }),
    notification(4, 1440),
    notification(5, 1440),
  ]
  let failList = false
  let failRead = false
  let failMore = false
  let hasMore = false
  const queries: Array<{ filter: string; page: string }> = []
  const reads: number[] = []
  await page.route('**/api/v1/notifications?*', (route) => {
    const params = new URL(route.request().url()).searchParams
    const filter = params.get('filter')!
    const pageNumber = params.get('page')!
    expect(params.get('size')).toBe('20')
    queries.push({ filter, page: pageNumber })
    if (failList || (failMore && pageNumber === '1'))
      return route.fulfill({ status: 503, json: { message: '알림 조회 오류' } })
    const filtered = items.filter((item) => filter === 'ALL' || !item.read)
    const content = hasMore
      ? filtered.slice(Number(pageNumber) * 2, Number(pageNumber) * 2 + 2)
      : filtered
    return route.fulfill({
      json: {
        data: {
          notifications: {
            content,
            number: Number(pageNumber),
            last: !hasMore || (Number(pageNumber) + 1) * 2 >= filtered.length,
            totalPages: hasMore ? Math.ceil(filtered.length / 2) : 1,
            totalElements: filtered.length,
          },
          unreadCount: items.filter((item) => !item.read).length,
        },
      },
    })
  })
  await page.route('**/api/v1/notifications/*/read', (route) => {
    expect(route.request().method()).toBe('PATCH')
    const id = Number(new URL(route.request().url()).pathname.split('/').at(-2))
    reads.push(id)
    if (failRead) return route.fulfill({ status: 503, json: { message: '읽음 처리 실패' } })
    items = items.map((item) => (item.notificationId === id ? { ...item, read: true } : item))
    return route.fulfill({ json: { data: items.find((item) => item.notificationId === id) } })
  })
  const errors: string[] = []
  page.on('pageerror', (error) => errors.push(error.message))
  return {
    queries,
    reads,
    errors,
    failList: (value: boolean) => {
      failList = value
    },
    failRead: (value: boolean) => {
      failRead = value
    },
    failMore: (value: boolean) => {
      failMore = value
    },
    enablePagination: () => {
      hasMore = true
    },
  }
}

test('matches the Figma list on desktop and mobile and filters unread notifications with the keyboard', async ({
  page,
}, testInfo) => {
  const api = await prepareNotifications(page)
  await page.goto('/notifications')
  await expect(page.getByRole('heading', { name: '알림', exact: true })).toBeVisible()
  const list = page.getByRole('tabpanel')
  await expect(list.getByRole('listitem')).toHaveCount(5)
  await expect(page.getByRole('tab', { name: '안읽음 2' })).toBeVisible()
  await page.screenshot({ path: testInfo.outputPath('notifications-desktop.png'), fullPage: true })
  await page.setViewportSize({ width: 402, height: 874 })
  await expect
    .poll(() => page.locator('main').evaluate((main) => main.scrollWidth - main.clientWidth))
    .toBeLessThanOrEqual(1)
  const avatars = list.locator('li img')
  for (const image of await avatars.all()) {
    await expect
      .poll(() =>
        image.evaluate((element: HTMLImageElement) => element.complete && element.naturalWidth > 0),
      )
      .toBe(true)
    await expect(image).toHaveCSS('width', '40px')
    await expect(image).toHaveCSS('height', '40px')
  }
  await page.screenshot({
    path: testInfo.outputPath('notifications-mobile-all.png'),
    fullPage: true,
  })
  await page.getByRole('tab', { name: '전체', exact: true }).focus()
  await page.keyboard.press('ArrowRight')
  await expect(page.getByRole('tab', { name: '안읽음 2' })).toBeFocused()
  await expect(list.getByRole('listitem')).toHaveCount(2)
  await expect(page.getByRole('tab', { name: '안읽음 2' })).toHaveAttribute('aria-selected', 'true')
  await expect(page.getByRole('tab', { name: '안읽음 2' })).toHaveCSS(
    'background-color',
    'rgb(49, 49, 53)',
  )
  expect(api.queries).toContainEqual({ filter: 'UNREAD', page: '0' })
  await page.screenshot({
    path: testInfo.outputPath('notifications-mobile-unread.png'),
    fullPage: true,
  })
  expect(api.errors).toEqual([])
})

test('keeps unread state on failure, retries the same item, then opens its post after server success', async ({
  page,
}) => {
  const api = await prepareNotifications(page)
  api.failRead(true)
  await page.route('**/api/v1/community/posts/11', (route) =>
    route.fulfill({ status: 404, json: { detail: '게시글이 삭제됐어요.' } }),
  )
  await page.goto('/notifications')
  await page.getByRole('tab', { name: '안읽음 2' }).click()
  const item = page.getByRole('button', { name: /조상철/ })
  await item.click()
  await expect(page.getByRole('alert')).toHaveText('읽음 처리 실패')
  await expect(page).toHaveURL(/\/notifications$/)
  await expect(page.getByRole('tab', { name: '안읽음 2' })).toBeVisible()
  api.failRead(false)
  await item.click()
  await expect(page).toHaveURL(/\/community\/11$/)
  expect(api.reads).toEqual([1, 1])
  await page.goBack()
  await expect(page.getByRole('tab', { name: '안읽음 1' })).toBeVisible()
  expect(api.errors).toEqual([])
})

test('marks a training reminder read before opening the training catalogue', async ({ page }) => {
  const api = await prepareNotifications(page)
  await page.route('**/api/v1/scenario/scenarios*', (route) =>
    route.fulfill({ json: { scenarios: [] } }),
  )
  await page.goto('/notifications')
  await page.getByRole('button', { name: /시나리오 훈련 3분 전/ }).click()
  await expect(page).toHaveURL(/\/training$/)
  expect(api.reads).toEqual([2])
})

test('retries list failures and renders the Figma empty state for both filters', async ({
  page,
}, testInfo) => {
  const api = await prepareNotifications(page, [])
  api.failList(true)
  await page.goto('/notifications')
  await expect(page.getByRole('alert')).toContainText('알림 조회 오류')
  api.failList(false)
  await page.getByRole('button', { name: '다시 불러오기' }).click()
  await expect(page.getByText('표시할 알림이 없어요.')).toBeVisible()
  await page.setViewportSize({ width: 402, height: 874 })
  const empty = page.getByRole('status').locator('img')
  await expect(empty).toHaveCSS('width', '36px')
  await expect(empty).toHaveCSS('height', '40px')
  await page.screenshot({
    path: testInfo.outputPath('notifications-mobile-empty.png'),
    fullPage: true,
  })
  await page.getByRole('tab', { name: '안읽음', exact: true }).click()
  await expect(page.getByText('표시할 알림이 없어요.')).toBeVisible()
  expect(api.errors).toEqual([])
})

test('preserves existing notifications when loading another page fails and retries only that page', async ({
  page,
}) => {
  const api = await prepareNotifications(page)
  api.enablePagination()
  api.failMore(true)
  await page.goto('/notifications')
  await expect(page.getByRole('listitem')).toHaveCount(2)
  await page.getByRole('button', { name: '더 보기', exact: true }).click()
  await expect(page.getByRole('alert')).toContainText('추가 알림을 불러오지 못했어요.')
  await expect(page.getByRole('listitem')).toHaveCount(2)
  api.failMore(false)
  await page.getByRole('button', { name: '다시 불러오기' }).click()
  await expect(page.getByRole('listitem')).toHaveCount(4)
  await page.getByRole('button', { name: '더 보기', exact: true }).click()
  await expect(page.getByRole('listitem')).toHaveCount(5)
  await expect(page.getByRole('button', { name: '더 보기', exact: true })).toHaveCount(0)
  expect(api.queries).toContainEqual({ filter: 'ALL', page: '2' })
  expect(api.errors).toEqual([])
})

test('resolves actor image storage keys and restores the default profile when an image fails', async ({
  page,
}) => {
  const api = await prepareNotifications(page, [
    notification(1, 1, { actorProfileImage: 'profiles/actor.png' }),
    notification(3, 420, { actorProfileImage: 'https://avatar.invalid/missing.png' }),
  ])
  let imageRequests = 0
  await page.route('**/api/v1/file?*', (route) => {
    expect(route.request().method()).toBe('POST')
    expect(new URL(route.request().url()).searchParams.get('s3Key')).toBe('profiles/actor.png')
    imageRequests++
    return route.fulfill({
      json: { data: { url: '/src/shared/assets/notifications/training-profile.png' } },
    })
  })
  await page.route('https://avatar.invalid/**', (route) => route.abort())
  await page.goto('/notifications')
  const actor = page.getByRole('button', { name: /조상철/ })
  await expect(actor.locator('img')).toHaveCount(2)
  await expect
    .poll(() =>
      actor
        .locator('img')
        .last()
        .evaluate((image: HTMLImageElement) => image.complete && image.naturalWidth > 0),
    )
    .toBe(true)
  const fallback = page.getByRole('button', { name: /이도연/ })
  await expect(fallback.locator('img')).toHaveCount(1)
  await expect(fallback.locator('img')).toHaveAttribute('src', /default-profile.png/)
  expect(imageRequests).toBe(1)
  expect(api.errors).toEqual([])
})
