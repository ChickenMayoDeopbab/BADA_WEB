import { expect, test } from '@playwright/test'
import { authenticate } from './authFixture'

test.beforeEach(async ({ page }) => {
  await authenticate(page)
  await page.route('**/api/v1/**', (route) => {
    const path = new URL(route.request().url()).pathname
    if (path.endsWith('/ringtones')) return route.fulfill({ json: { data: [] } })
    if (path.endsWith('/training-records'))
      return route.fulfill({ json: { data: { content: [] } } })
    return route.fulfill({ json: { data: {} } })
  })
})

test('uploads, previews, saves and deletes a ringtone through the existing profile screen', async ({
  page,
}, testInfo) => {
  let ringtones = [
    {
      fileId: 9,
      title: '내 파도 소리',
      url: '/src/shared/assets/scenario-training/ringtone-default.mp3',
    },
  ]
  let selectedId: number | null = 9
  let uploadCount = 0
  await page.route('**/api/v1/ringtones', async (route) => {
    if (route.request().method() === 'POST') {
      expect(route.request().headers()['content-type']).toContain('multipart/form-data; boundary=')
      uploadCount += 1
      const ringtone = { fileId: 10, title: '새 벨소리.mp3', url: ringtones[0].url }
      ringtones.push(ringtone)
      return route.fulfill({ status: 201, json: { data: ringtone } })
    }
    return route.fulfill({ json: { data: ringtones } })
  })
  await page.route('**/api/v1/ringtones/settings', (route) => {
    if (route.request().method() === 'PUT') selectedId = route.request().postDataJSON().fileId
    return route.fulfill({
      json: { data: { defaultRingtone: selectedId === null, fileId: selectedId } },
    })
  })
  await page.route('**/api/v1/ringtones/10', (route) => {
    if (route.request().method() === 'DELETE') {
      ringtones = ringtones.filter((ringtone) => ringtone.fileId !== 10)
      selectedId = null
      return route.fulfill({ json: { status: 200 } })
    }
    return route.fulfill({ json: { data: ringtones.find((ringtone) => ringtone.fileId === 10) } })
  })
  await page.goto('/profile/ringtone')
  await expect(page.getByRole('radio', { name: /내 파도 소리/ })).toBeChecked()
  await page.getByLabel('벨소리 파일').setInputFiles({
    name: '새 벨소리.mp3',
    mimeType: 'audio/mpeg',
    buffer: Buffer.from('mock audio upload'),
  })
  await expect(page.getByRole('radio', { name: /새 벨소리.mp3/ })).toBeChecked()
  expect(uploadCount).toBe(1)
  await page.getByRole('button', { name: '새 벨소리.mp3 미리듣기' }).click()
  await expect(page.getByRole('button', { name: '새 벨소리.mp3 정지' })).toBeVisible()
  await page.getByRole('button', { name: '새 벨소리.mp3 정지' }).click()
  await page.screenshot({ path: testInfo.outputPath('ringtone-desktop.png'), fullPage: true })
  await page.getByRole('button', { name: '저장', exact: true }).click()
  await expect(page).toHaveURL(/\/profile$/)
  expect(selectedId).toBe(10)
  await page.goto('/profile/ringtone')
  await expect(page.getByRole('radio', { name: /새 벨소리.mp3/ })).toBeChecked()
  await page.getByRole('button', { name: '새 벨소리.mp3 삭제' }).click()
  await page.getByRole('dialog').getByRole('button', { name: '삭제', exact: true }).click()
  await expect(page.getByRole('radio', { name: /새 벨소리.mp3/ })).toHaveCount(0)
  await expect(page.getByRole('radio', { name: /기본 벨소리/ })).toBeChecked()
  await page.setViewportSize({ width: 390, height: 844 })
  await page.screenshot({ path: testInfo.outputPath('ringtone-mobile.png'), fullPage: true })
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(
    true,
  )
})

test('reports posts, comments and replies using each content ID and allows retry after failure', async ({
  page,
}, testInfo) => {
  const author = { user_id: 20, name: '작성자', profile_image_url: null }
  const created_at = '2026-10-15T00:00:00Z'
  const reports: string[] = []
  await page.route('**/api/v1/community/posts/11', (route) =>
    route.fulfill({
      json: {
        post_id: 11,
        title: '대화 연습 후기',
        content: '오늘 연습을 마쳤어요.',
        author,
        view_count: 3,
        comment_count: 2,
        reactions: {},
        my_reaction: null,
        created_at,
        attachments: [],
      },
    }),
  )
  await page.route('**/api/v1/community/posts/11/comments', (route) =>
    route.fulfill({
      json: {
        comments: [
          {
            comment_id: 21,
            content: '함께 연습해요.',
            author: { ...author, name: '댓글작성자' },
            created_at,
            replies: [
              {
                comment_id: 31,
                content: '응원합니다.',
                author: { ...author, name: '답글작성자' },
                created_at,
              },
            ],
          },
        ],
      },
    }),
  )
  await page.route('**/api/v1/community/**/reports', (route) => {
    const path = new URL(route.request().url()).pathname
    reports.push(path.replace(/^\/__bada_ai/, ''))
    expect(route.request().postDataJSON()).toEqual({ reason: 'SPAM' })
    if (reports.length === 1)
      return route.fulfill({ status: 503, json: { detail: '잠시 후 다시 시도해 주세요.' } })
    return route.fulfill({ status: 201, json: { report_id: reports.length } })
  })
  await page.goto('/community/11')
  const refreshButton = page.getByRole('button', { name: '댓글 새로고침' })
  await expect(refreshButton).toBeEnabled()
  const refreshIcon = refreshButton.locator('svg')
  await refreshIcon.evaluate((icon) => {
    icon.addEventListener('animationiteration', () =>
      icon.setAttribute('data-completed-rotation', 'true'),
    )
  })
  await refreshButton.click()
  await expect(refreshButton).toHaveAttribute('aria-busy', 'true')
  await expect(refreshIcon).toHaveCSS('animation-duration', '0.45s')
  await expect(refreshIcon).toHaveAttribute('data-completed-rotation', 'true')
  await expect(refreshButton).toHaveAttribute('aria-busy', 'false')
  for (const name of ['작성자', '댓글작성자', '답글작성자']) {
    if (name === '답글작성자') await page.getByRole('button', { name: '↳ 답글 1개 보기' }).click()
    const target = name === '작성자' ? '게시글' : name === '댓글작성자' ? '댓글' : '답글'
    await page.getByRole('button', { name: `@${name} ${target} 메뉴`, exact: true }).click()
    await page.getByRole('menuitem', { name: `${target} 신고하기`, exact: true }).click()
    const dialog = page.getByRole('dialog')
    const reason = dialog.getByRole('radio', { name: '스팸 및 광고' })
    await reason.locator('..').click()
    await expect(reason).toBeChecked()
    const indicator = reason.locator('..').locator('[data-radio-indicator]')
    expect(await reason.evaluate((input) => getComputedStyle(input).clipPath)).toBe('inset(50%)')
    await expect
      .poll(() =>
        indicator.evaluate((mark) => {
          const color = getComputedStyle(mark).backgroundColor.match(/\d+/g)!.map(Number)
          return color[1] > color[0] && color[1] > color[2]
        }),
      )
      .toBe(true)
    if (name === '작성자')
      await page.screenshot({ path: testInfo.outputPath('report-dialog.png'), fullPage: true })
    await dialog.getByRole('button', { name: '신고하기', exact: true }).click()
    if (name === '작성자') {
      await expect(dialog.getByRole('alert')).toContainText('잠시 후 다시 시도해 주세요.')
      await expect(dialog.getByRole('radio', { name: '스팸 및 광고' })).toBeChecked()
      await dialog.getByRole('button', { name: '신고하기', exact: true }).click()
    }
    await expect(dialog).toHaveCount(0)
    const toast = page.getByRole('status')
    await expect(toast).toHaveText('신고가 접수되었습니다.')
    if (name === '작성자') {
      await page.screenshot({ path: testInfo.outputPath('report-toast.png'), fullPage: true })
      const bounds = await toast.boundingBox()
      expect(bounds!.x).toBeGreaterThan(page.viewportSize()!.width / 2)
      expect(bounds!.y).toBeLessThan(50)
      await expect(toast).toHaveCount(0, { timeout: 4000 })
    } else {
      await page.getByRole('button', { name: '알림 닫기' }).click()
    }
  }
  expect(reports).toEqual([
    '/api/v1/community/posts/11/reports',
    '/api/v1/community/posts/11/reports',
    '/api/v1/community/comments/21/reports',
    '/api/v1/community/comments/31/reports',
  ])
})

test('the sidebar retains the session after failed signout and clears it after retry', async ({
  page,
}) => {
  let attempts = 0
  await page.route('**/api/v1/auth/signout', (route) => {
    expect(route.request().method()).toBe('DELETE')
    expect(route.request().headers().authorization).toBe('Bearer test-access-token')
    attempts += 1
    return route.fulfill(
      attempts === 1
        ? { status: 503, json: { message: '로그아웃에 실패했어요.' } }
        : { json: { status: 200 } },
    )
  })
  await page.goto('/profile/ringtone')
  await page.getByRole('button', { name: '로그아웃', exact: true }).click()
  await expect(page.getByRole('alert')).toContainText('로그아웃에 실패했어요.')
  await expect(page).toHaveURL(/\/profile\/ringtone$/)
  expect(await page.evaluate(() => localStorage.getItem('bada.accessToken'))).toBe(
    'test-access-token',
  )
  await page.getByRole('button', { name: '로그아웃', exact: true }).click()
  await expect(page.getByRole('heading', { name: '랜딩 페이지' })).toBeVisible()
  expect(await page.evaluate(() => localStorage.getItem('bada.accessToken'))).toBeNull()
  expect(await page.evaluate(() => localStorage.getItem('bada.refreshToken'))).toBeNull()
})
