import { expect, test, type Page } from '@playwright/test'

/** 신고·차단·로그아웃 요청만 가짜 서버로 처리하고 실제 UI와 인증 인터셉터를 검증합니다. */
const prepareCommunity = async (page: Page) => {
  const accessToken = `header.${Buffer.from(JSON.stringify({ sub: '1', exp: Math.floor(Date.now() / 1000) + 3600 })).toString('base64url')}.signature`
  await page.addInitScript((token) => {
    for (const storage of [localStorage, sessionStorage]) {
      storage.setItem('bada.accessToken', token)
      storage.setItem('bada.refreshToken', token)
    }
  }, accessToken)
  const errors: string[] = []
  page.on('pageerror', (error) => errors.push(error.message))
  const now = new Date().toISOString()
  const author = (user_id: number, name: string) => ({ user_id, name, profile_image_url: null })
  const post = {
    post_id: 9,
    title: '신고 테스트 게시글',
    content: '게시글 내용',
    content_preview: '게시글 내용',
    author: author(42, '작성자'),
    view_count: 1,
    comment_count: 3,
    reactions: { cheer: 0, relate: 0, like: 0 },
    my_reaction: null,
    created_at: now,
    attachments: [],
  }
  const comments = [
    {
      comment_id: 21,
      content: '다른 사용자의 댓글',
      author: author(43, '댓글작성자'),
      created_at: now,
      replies: [
        {
          comment_id: 22,
          content: '다른 사용자의 답글',
          author: author(44, '답글작성자'),
          created_at: now,
        },
      ],
    },
    { comment_id: 23, content: '내 댓글', author: author(1, '나'), created_at: now, replies: [] },
  ]
  const reports: Array<{ path: string; body: unknown }> = []
  const blocks: string[] = []
  let logoutRequests = 0
  let reportFailures = 0
  let logoutFailures = 0
  let reportWait: Promise<void> | undefined
  let logoutWait: Promise<void> | undefined
  await page.route('**/api/v1/**', async (route) => {
    const request = route.request()
    const path = new URL(request.url()).pathname.replace(/^\/__bada_ai/, '')
    if (path.endsWith('/reports')) {
      expect(request.headers().authorization).toBe(`Bearer ${accessToken}`)
      reports.push({ path, body: request.postDataJSON() })
      const wait = reportWait
      reportWait = undefined
      if (wait) await wait
      if (reportFailures > 0) {
        reportFailures--
        return route.fulfill({
          status: 503,
          json: { detail: '신고 서버에 잠시 연결할 수 없습니다.' },
        })
      }
      return route.fulfill({
        status: 201,
        json: {
          report_id: reports.length,
          target_type: path.includes('/posts/') ? 'POST' : 'COMMENT',
          target_id: Number(path.split('/').at(-2)),
          reason: request.postDataJSON().reason,
          status: 'PENDING',
          created_at: now,
          due_at: now,
        },
      })
    }
    if (path.endsWith('/block')) {
      blocks.push(path)
      return route.fulfill({ status: 204 })
    }
    if (path === '/api/v1/auth/signout') {
      expect(request.method()).toBe('DELETE')
      expect(request.headers().authorization).toBe(`Bearer ${accessToken}`)
      logoutRequests++
      const wait = logoutWait
      logoutWait = undefined
      if (wait) await wait
      if (logoutFailures > 0) {
        logoutFailures--
        return route.fulfill({ status: 503, json: { message: '서버 로그아웃에 실패했습니다.' } })
      }
      return route.fulfill({ json: { data: null } })
    }
    if (path === '/api/v1/community/posts/9/comments') return route.fulfill({ json: { comments } })
    if (path === '/api/v1/community/posts/9') return route.fulfill({ json: post })
    if (path === '/api/v1/community/posts') return route.fulfill({ json: { posts: [post] } })
    if (path === '/api/v1/user/mypage')
      return route.fulfill({
        json: { data: { name: '나', username: 'me', email: 'me@example.com', level: 'LEVEL_2' } },
      })
    return route.fulfill({ json: { data: null } })
  })
  await page.goto('/community/9')
  await expect(page.getByRole('heading', { name: post.title })).toBeVisible()
  await expect(page.getByText('내 댓글', { exact: true })).toBeVisible()
  return {
    reports,
    blocks,
    errors,
    logoutRequests: () => logoutRequests,
    failNextReport: () => {
      reportFailures = 1
    },
    failNextLogout: () => {
      logoutFailures = 1
    },
    pauseReport: () => {
      let resume!: () => void
      reportWait = new Promise<void>((resolve) => {
        resume = resolve
      })
      return resume
    },
    pauseLogout: () => {
      let resume!: () => void
      logoutWait = new Promise<void>((resolve) => {
        resume = resolve
      })
      return resume
    },
  }
}

/** 대상별 메뉴에서 신고 사유 입력 창을 엽니다. */
const openReport = async (page: Page, name: string, target: '게시글' | '댓글' | '답글') => {
  await page.getByRole('button', { name: `@${name} ${target} 메뉴`, exact: true }).click()
  await page.getByRole('menuitem', { name: `${target} 신고하기`, exact: true }).click()
  return page.getByRole('dialog', { name: `${target} 신고하기`, exact: true })
}

test('requires a reason, cancels without requests and submits a post report once while pending', async ({
  page,
}) => {
  const api = await prepareCommunity(page)
  let dialog = await openReport(page, '작성자', '게시글')
  await expect(dialog.getByRole('button', { name: '신고하기', exact: true })).toBeDisabled()
  await dialog.getByRole('radio', { name: '스팸 및 광고' }).check()
  await page.setViewportSize({ width: 390, height: 844 })
  await page.screenshot({ path: 'test-results/community-report-mobile.png' })
  await dialog.getByRole('button', { name: '취소', exact: true }).click()
  expect(api.reports).toEqual([])
  await page.setViewportSize({ width: 1280, height: 720 })
  dialog = await openReport(page, '작성자', '게시글')
  await expect(dialog.getByRole('radio', { name: '스팸 및 광고' })).not.toBeChecked()
  await dialog.getByRole('radio', { name: '스팸 및 광고' }).check()
  const resume = api.pauseReport()
  await dialog.getByRole('button', { name: '신고하기', exact: true }).click()
  await expect.poll(() => api.reports.length).toBe(1)
  await expect(dialog.getByRole('button', { name: '처리 중', exact: true })).toBeDisabled()
  await expect(dialog.getByRole('button', { name: '취소', exact: true })).toBeDisabled()
  await expect(dialog.getByRole('radio', { name: '스팸 및 광고' })).toBeDisabled()
  await page.keyboard.press('Escape')
  await expect(dialog).toBeVisible()
  resume()
  await expect(dialog).toHaveCount(0)
  await expect(page.getByRole('status')).toContainText('게시글 신고를 접수했습니다.')
  expect(api.reports).toEqual([
    { path: '/api/v1/community/posts/9/reports', body: { reason: 'SPAM' } },
  ])
  expect(api.blocks).toEqual([])
  expect(api.errors).toEqual([])
})

test('reports comments and replies through their own IDs and keeps own content management separate', async ({
  page,
}) => {
  const api = await prepareCommunity(page)
  await expect(page.getByRole('button', { name: '@나 댓글 메뉴' })).toHaveCount(0)
  let dialog = await openReport(page, '댓글작성자', '댓글')
  await dialog.getByRole('radio', { name: '개인정보 노출' }).check()
  await dialog.getByRole('button', { name: '신고하기', exact: true }).click()
  await expect(dialog).toHaveCount(0)
  await page.getByRole('button', { name: '↳ 답글 1개 보기', exact: true }).click()
  dialog = await openReport(page, '답글작성자', '답글')
  await dialog.getByRole('radio', { name: '욕설 및 괴롭힘' }).check()
  await dialog.getByRole('button', { name: '신고하기', exact: true }).click()
  await expect(dialog).toHaveCount(0)
  expect(api.reports).toEqual([
    { path: '/api/v1/community/comments/21/reports', body: { reason: 'PRIVACY' } },
    { path: '/api/v1/community/comments/22/reports', body: { reason: 'ABUSE' } },
  ])
  expect(api.errors).toEqual([])
})

test('keeps the report dialog and reason on server failure and allows an explicit retry', async ({
  page,
}) => {
  const api = await prepareCommunity(page)
  api.failNextReport()
  const dialog = await openReport(page, '작성자', '게시글')
  await dialog.getByRole('radio', { name: '혐오 표현' }).check()
  await dialog.getByRole('button', { name: '신고하기', exact: true }).click()
  await expect(dialog.getByRole('alert')).toHaveText('신고 서버에 잠시 연결할 수 없습니다.')
  await expect(dialog.getByRole('radio', { name: '혐오 표현' })).toBeChecked()
  await expect(page.getByRole('status')).toHaveCount(0)
  expect(api.reports).toHaveLength(1)
  await dialog.getByRole('button', { name: '신고하기', exact: true }).click()
  await expect(dialog).toHaveCount(0)
  expect(api.reports).toHaveLength(2)
  expect(api.errors).toEqual([])
})

test('preserves user blocking alongside the report menu', async ({ page }) => {
  const api = await prepareCommunity(page)
  await page.getByRole('button', { name: '@작성자 게시글 메뉴', exact: true }).click()
  await page.getByRole('menuitem', { name: '사용자 차단하기', exact: true }).click()
  await page.getByRole('dialog').getByRole('button', { name: '차단하기', exact: true }).click()
  await expect(page).toHaveURL(/\/community$/)
  expect(api.blocks).toEqual(['/api/v1/community/users/42/block'])
  expect(api.reports).toEqual([])
})

test('waits for server logout, preserves credentials on failure and clears both storages after retry success', async ({
  page,
}) => {
  const api = await prepareCommunity(page)
  api.failNextLogout()
  const resume = api.pauseLogout()
  await page.getByRole('button', { name: '로그아웃', exact: true }).click()
  await expect.poll(api.logoutRequests).toBe(1)
  await expect(page.getByRole('button', { name: '로그아웃 중...', exact: true })).toBeDisabled()
  await expect(page).toHaveURL(/\/community\/9$/)
  expect(await page.evaluate(() => Boolean(localStorage.getItem('bada.accessToken')))).toBe(true)
  resume()
  await expect(page.getByRole('alert')).toHaveText('서버 로그아웃에 실패했습니다.')
  expect(await page.evaluate(() => Boolean(localStorage.getItem('bada.refreshToken')))).toBe(true)
  await page.getByRole('button', { name: '로그아웃', exact: true }).click()
  await expect(page).toHaveURL(/\/$/)
  expect(
    await page.evaluate(() =>
      [localStorage, sessionStorage].every(
        (storage) =>
          storage.getItem('bada.accessToken') === null &&
          storage.getItem('bada.refreshToken') === null,
      ),
    ),
  ).toBe(true)
  expect(api.logoutRequests()).toBe(2)
  expect(api.errors).toEqual([])
})
