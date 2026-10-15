import { expect, test, type Page } from '@playwright/test'
import { authenticate } from './authFixture'

/** 공통 요청은 빈 응답으로 격리하고 실제 인증 가드를 통과합니다. */
const prepare = async (page: Page) => {
  await page.route('**/api/v1/**', (route) => route.fulfill({ json: { data: {} } }))
  await authenticate(page)
  await page.route('**/api/v1/legal-consents/status', (route) =>
    route.fulfill({
      json: {
        data: {
          termsOfServiceAgreed: true,
          privacyPolicyAcknowledged: true,
          sensitiveInformationAgreed: true,
          profileImageAgreed: false,
          legalActionRequired: false,
        },
      },
    }),
  )
}

test('retains a failed inquiry, retries it, then shows confirmed receipt', async ({ page }) => {
  await prepare(page)
  let attempts = 0
  await page.route('**/api/v1/inquiries', (route) => {
    expect(route.request().method()).toBe('POST')
    expect(route.request().postDataJSON()).toEqual({
      title: '녹음 관련 문의',
      content: '통화 녹음에 대해 문의합니다.',
    })
    attempts++
    return attempts === 1
      ? route.fulfill({ status: 503, json: { message: '전송 오류' } })
      : route.fulfill({ json: { message: '문의가 전송되었습니다.' } })
  })
  await page.goto('/profile/inquiry')
  await page.getByRole('textbox', { name: '제목', exact: true }).fill('녹음 관련 문의')
  await page.getByRole('textbox', { name: '문의 내용' }).fill('통화 녹음에 대해 문의합니다.')
  await page.getByRole('button', { name: '문의 보내기' }).click()
  await expect(page.getByRole('textbox', { name: '제목', exact: true })).toHaveValue(
    '녹음 관련 문의',
  )
  await expect(page.getByRole('alert').first()).toBeVisible()
  await page.getByRole('button', { name: '문의 보내기' }).click()
  await expect(page.getByRole('heading', { name: '문의를 접수했어요.' })).toBeVisible()
  expect(attempts).toBe(2)
})

test('registers payment interest once, without a payment, and reloads the stored state', async ({
  page,
}) => {
  await prepare(page)
  let registered = false
  let registrations = 0
  await page.route('**/api/v1/payment-intents/me', (route) =>
    route.fulfill({ json: { data: { paymentIntended: registered } } }),
  )
  await page.route('**/api/v1/payment-intents', (route) => {
    expect(route.request().method()).toBe('POST')
    expect(route.request().postData()).toBe(null)
    registered = true
    registrations++
    return route.fulfill({ json: { data: { paymentIntended: true } } })
  })
  await page.goto('/profile/payment-interest')
  await expect(page.getByText(/요금이 청구되지 않아요/)).toBeVisible()
  await page.getByRole('button', { name: '관심 등록하기' }).click()
  await expect(
    page.getByRole('status').filter({ hasText: '관심 등록을 완료했어요.' }),
  ).toBeVisible()
  await page.reload()
  await expect(page.getByText('관심 등록을 완료했어요.', { exact: true })).toBeVisible()
  await expect(page.getByRole('button', { name: '관심 등록하기' })).toHaveCount(0)
  expect(registrations).toBe(1)
})

test('creates a 30-second WARMUP session and opens YouTube without playback controls', async ({
  page,
}) => {
  await prepare(page)
  await page.route('**/api/v1/scenario/custom', (route) => {
    expect(route.request().postDataJSON()).toMatchObject({
      is_warmup: true,
      call_target: '카페 직원',
      call_purpose: '카페 영업시간 물어보기',
    })
    return route.fulfill({
      json: {
        scenario: {
          scenario_id: 81,
          title: '카페 직원와의 워밍업',
          content: '영업시간을 물어보세요.',
        },
      },
    })
  })
  await page.route('**/api/v1/session', (route) => {
    expect(route.request().postDataJSON()).toEqual({
      scenarioId: 81,
      type: 'WARMUP',
      aiPersonality: 'KIND',
      difficulty: 'low',
      maxDurationSeconds: 30,
    })
    return route.fulfill({
      json: { data: { sessionId: 'warmup-81', wsUrl: 'ws://localhost/voice' } },
    })
  })
  await page.goto('/training/warmup')
  await page.getByRole('textbox', { name: '통화 상대', exact: true }).fill('카페 직원')
  await page.getByRole('textbox', { name: '통화 목적', exact: true }).fill('카페 영업시간 물어보기')
  await page.getByRole('button', { name: '30초 워밍업 시작' }).click()
  await expect(page).toHaveURL(/\/training\/81\/call$/)
  await page.route('https://www.youtube-nocookie.com/embed/**', (route) =>
    route.fulfill({
      contentType: 'text/html',
      body: '<html><body style="margin:0;background:black"></body></html>',
    }),
  )
  await page.getByRole('button', { name: '명상하기', exact: true }).click()
  const video = page.getByTitle('통화 전 명상 영상')
  await expect(video).toBeVisible()
  const source = new URL((await video.getAttribute('src'))!)
  expect(source.hostname).toBe('www.youtube-nocookie.com')
  expect(source.pathname).toBe('/embed/z6b5nLI6BqI')
  expect(source.searchParams.get('controls')).toBe('0')
  expect(source.searchParams.get('autoplay')).toBe('1')
  await expect(page.getByRole('button', { name: '명상 끝내고 전화하기' })).toBeVisible()
  expect(
    await page.evaluate(() => document.documentElement.scrollHeight <= window.innerHeight),
  ).toBe(true)
})

test('keeps Korean display and removes language settings even with an old saved preference', async ({
  page,
}) => {
  await prepare(page)
  await page.addInitScript(() => localStorage.setItem('bada:display-language', 'en'))
  await page.goto('/profile')
  await expect(page.getByRole('heading', { name: '프로필', exact: true })).toBeVisible()
  await expect(page.getByRole('link', { name: /언어 설정|Language settings/ })).toHaveCount(0)
  await expect(page.locator('html')).toHaveAttribute('lang', 'ko')
  await page.reload()
  await expect(page.getByRole('heading', { name: '프로필', exact: true })).toBeVisible()
})

test('loads more community posts and searches all pages of my posts', async ({ page }) => {
  await prepare(page)
  const author = { user_id: 42, name: '김바다', profile_image_url: null }
  const post = (id: number, title: string) => ({
    post_id: id,
    title,
    content_preview: '연습 후기',
    author,
    view_count: 1,
    comment_count: 0,
    reactions: {},
    created_at: new Date().toISOString(),
  })
  const queries: number[] = []
  await page.route('**/api/v1/community/posts?*', (route) => {
    const pageNumber = Number(new URL(route.request().url()).searchParams.get('page'))
    queries.push(pageNumber)
    return route.fulfill({
      json: { posts: [post(pageNumber, `페이지 ${pageNumber} 글`)], has_next: pageNumber === 1 },
    })
  })
  await page.route('**/api/v1/community/me/posts?*', (route) => {
    const params = new URL(route.request().url()).searchParams
    expect(params.has('q')).toBe(false)
    const pageNumber = Number(params.get('page'))
    return route.fulfill({
      json: {
        posts: [post(10 + pageNumber, pageNumber === 1 ? '카페 후기' : '병원 후기')],
        has_next: pageNumber === 1,
      },
    })
  })
  await page.goto('/community')
  await expect(page.getByText('페이지 1 글', { exact: true })).toBeVisible()
  await page.getByRole('button', { name: '더 보기', exact: true }).click()
  await expect(page.getByText('페이지 2 글', { exact: true })).toBeVisible()
  expect(queries).toEqual([1, 2])
  await page.getByRole('tab', { name: '내 글' }).click()
  await page.getByRole('searchbox', { name: '커뮤니티 검색' }).fill('병원')
  await expect(page.getByText('병원 후기', { exact: true })).toBeVisible()
  await expect(page.getByText('카페 후기', { exact: true })).toHaveCount(0)
})

test('omits the added full recording and transcript blocks from record details', async ({
  page,
}) => {
  await prepare(page)
  await page.route('**/api/v1/training-records?*', (route) =>
    route.fulfill({ json: { data: { content: [], number: 0, totalPages: 0 } } }),
  )
  await page.route('**/api/v1/training-records/7', (route) =>
    route.fulfill({
      json: {
        data: {
          recordId: 7,
          sessionId: 'record-7',
          trainedAt: new Date().toISOString(),
          scenarioId: 1,
          scenarioName: '짧은 연습',
          sessionType: 'WARMUP',
          aiPersonality: 'KIND',
          durationSeconds: 30,
          positiveFeedbacks: [],
          recordingUrl: '/api/v1/training-records/7/recording?token=signed-audio',
          transcript: [
            { role: 'user', text: '안녕하세요. 영업시간이 궁금해요.' },
            { role: 'ai', text: '오전 10시에 열어요.' },
          ],
        },
      },
    }),
  )
  await page.goto('/records?recordId=7')
  await expect(page.getByRole('dialog', { name: '훈련 기록 상세' })).toBeVisible()
  await expect(page.getByText('전체 통화 녹음', { exact: true })).toHaveCount(0)
  await expect(page.getByText('전체 대화 보기', { exact: true })).toHaveCount(0)
  await expect(page.getByText('통화 타임라인', { exact: true })).toHaveCount(0)
  await expect(page.getByText('안녕하세요. 영업시간이 궁금해요.', { exact: true })).toHaveCount(0)
})

test('keeps the notification badge and removes the extra quick settings', async ({ page }) => {
  await prepare(page)
  let unreadCount = 0
  await page.route('**/api/v1/notifications?*', (route) =>
    route.fulfill({
      json: { data: { unreadCount, notifications: { content: [], number: 0, last: true } } },
    }),
  )
  await page.route('**/api/v1/training-records?*', (route) =>
    route.fulfill({ json: { data: { content: [], number: 0, totalPages: 0 } } }),
  )
  await page.goto('/profile')
  const badge = page.getByRole('link', { name: '알림', exact: true }).locator('.bg-status-error')
  await expect(badge).toHaveCount(0)
  unreadCount = 2
  await page.reload()
  await expect(badge).toBeVisible()
  await page.setViewportSize({ width: 390, height: 844 })
  for (const name of ['알림 목록', '문의하기', '서비스 관심 등록']) {
    await expect(page.getByRole('link', { name: new RegExp(name) })).toHaveCount(0)
  }
})

test('shows the shared toast after deleting a training record and dismisses it automatically', async ({
  page,
}) => {
  await prepare(page)
  await page.route('**/api/v1/training-records?*', (route) =>
    route.fulfill({ json: { data: { content: [], number: 0, totalPages: 0 } } }),
  )
  await page.route('**/api/v1/training-records/7', (route) => {
    if (route.request().method() === 'DELETE') return route.fulfill({ status: 204 })
    return route.fulfill({
      json: {
        data: {
          recordId: 7,
          sessionId: 'record-7',
          trainedAt: new Date().toISOString(),
          scenarioId: 1,
          scenarioName: '짧은 연습',
          sessionType: 'WARMUP',
          aiPersonality: 'KIND',
          durationSeconds: 30,
          positiveFeedbacks: [],
        },
      },
    })
  })
  await page.goto('/records?recordId=7')
  const dialog = page.getByRole('dialog', { name: '훈련 기록 상세' })
  await expect(dialog).toBeVisible()
  const toast = page.getByRole('status').filter({ hasText: '훈련 기록을 삭제했어요.' })
  await expect(toast).toHaveCount(0)
  await dialog.getByRole('button', { name: '기록 메뉴 열기' }).click()
  await dialog.getByRole('button', { name: '기록 삭제하기' }).click()
  await expect(dialog).toBeHidden()
  await expect(toast).toBeVisible()
  await expect(toast.locator('..').locator('[data-toast-progress]')).toHaveCSS(
    'animation-duration',
    '2.5s',
  )
  await expect(toast).toHaveCount(0, { timeout: 5000 })
})
