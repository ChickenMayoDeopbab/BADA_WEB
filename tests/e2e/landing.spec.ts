import { expect, test } from '@playwright/test'
import { authenticate } from './authFixture'

test('explores a conversation and resets the preview when another situation is selected', async ({
  page,
}) => {
  await page.goto('/')
  await page.getByRole('button', { name: /업무.*회의 일정 조율하기/ }).click()
  await expect(page.getByRole('heading', { name: '회의 일정 조율하기' })).toBeVisible()
  await page.getByRole('button', { name: '다음 대화 보기', exact: true }).click()
  await expect(
    page.getByText('네, 가능합니다. 내일 오후 2시에 뵙겠습니다.', { exact: true }),
  ).toBeVisible()
  await page.getByRole('button', { name: '피드백 예시 보기', exact: true }).click()
  await expect(page.getByRole('heading', { name: '이렇게 대화를 돌아봐요.' })).toBeVisible()
  await page.getByRole('button', { name: /학교.*교수님께 상담 요청하기/ }).click()
  await expect(page.getByRole('heading', { name: '교수님께 상담 요청하기' })).toBeVisible()
  await expect(page.getByRole('button', { name: '다음 대화 보기', exact: true })).toBeVisible()
  await expect(page.getByRole('heading', { name: '이렇게 대화를 돌아봐요.' })).toHaveCount(0)
})

test('supports keyboard feature navigation and keeps the real feature destination for login', async ({
  page,
}) => {
  await page.goto('/')
  const firstTab = page.getByRole('tab', { name: '자가진단', exact: true })
  await firstTab.focus()
  await firstTab.press('ArrowRight')
  const trainingTab = page.getByRole('tab', { name: 'AI 통화 연습', exact: true })
  await expect(trainingTab).toBeFocused()
  await expect(trainingTab).toHaveAttribute('aria-selected', 'true')
  await expect(page.getByRole('tabpanel')).toHaveCount(1)
  await page.getByRole('link', { name: '시나리오 보러 가기', exact: true }).click()
  await expect(page).toHaveURL(/\/login$/)
  expect(await page.evaluate(() => window.history.state.usr.from)).toBe('/training')
})

test('sends an existing session to the actual web service', async ({ page }) => {
  await page.route('**/api/v1/**', (route) => route.abort())
  await authenticate(page)
  await page.goto('/')
  const entry = page
    .getByRole('navigation', { name: '랜딩 메뉴' })
    .getByRole('link', { name: '웹에서 시작', exact: true })
  await expect(entry).toHaveAttribute('href', '/dashboard')
  await entry.click()
  await expect(page).toHaveURL(/\/dashboard$/)
  await expect(page.getByRole('navigation', { name: '주요 메뉴' })).toBeVisible()
})

test('opens policy documents publicly without authentication or consent requests', async ({
  page,
}) => {
  const requests: string[] = []
  await page.route('**/api/v1/**', (route) => {
    requests.push(route.request().url())
    return route.abort()
  })
  for (const [path, title] of [
    ['/terms', '서비스 이용약관'],
    ['/privacy', '개인정보처리방침'],
    ['/sensitive-information', '민감정보 처리 안내'],
  ]) {
    await page.goto(path)
    await expect(page.getByRole('heading', { name: title, exact: true, level: 1 })).toBeVisible()
    await expect(page).toHaveURL(new RegExp(`${path}$`))
  }
  expect(requests).toEqual([])
  await page.goto('/')
  await page.getByRole('link', { name: '서비스 이용약관', exact: true }).click()
  await expect(page.getByRole('heading', { level: 1 })).toBeInViewport()
  await page.getByRole('link', { name: '홈으로', exact: true }).click()
  await expect(page.getByRole('heading', { level: 1 })).toBeInViewport()
})

test('keeps mobile navigation, footer channels, and store link states usable', async ({ page }) => {
  for (const width of [320, 390, 768, 1280]) {
    await page.setViewportSize({ width, height: 900 })
    await page.goto('/')
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(
      width,
    )
    const navigation = page.getByRole('navigation', { name: '랜딩 메뉴' })
    await expect(navigation.getByRole('link', { name: '로그인', exact: true })).toBeVisible()
    await navigation.getByRole('link', { name: '앱 다운로드', exact: true }).click()
    await expect(page.getByRole('heading', { name: '앱으로 시작해보기' })).toBeInViewport()
  }
  const channels = page.getByRole('navigation', { name: 'BADA 공식 채널' })
  await expect(channels.getByRole('link', { name: /GitHub/ })).toHaveAttribute(
    'href',
    'https://github.com/orgs/ChickenMayoDeopbab',
  )
  await expect(channels.getByRole('link', { name: /Instagram/ })).toHaveAttribute(
    'href',
    'https://www.instagram.com/bada.callphobia/',
  )
  await expect(page.locator('a[href="#"]')).toHaveCount(0)
  const stores = page.locator('#download').locator('a, button')
  await expect(stores).toHaveCount(2)
  for (const store of await stores.all()) {
    const href = await store.getAttribute('href')
    if (href) expect(href).toMatch(/^https:\/\//)
    else await expect(store).toBeDisabled()
  }
  await page.goto('/')
  await expect
    .poll(() =>
      page
        .locator('main img')
        .first()
        .evaluate((image: HTMLImageElement) => image.naturalWidth),
    )
    .toBeGreaterThan(0)
  await page.screenshot({ path: test.info().outputPath('landing-desktop.png') })
  await page.setViewportSize({ width: 390, height: 844 })
  await page.screenshot({ path: test.info().outputPath('landing-mobile.png') })
})
