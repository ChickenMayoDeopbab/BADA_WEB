import { expect, test } from '@playwright/test'
import { authenticate } from './authFixture'

test('answers the essential start questions without leaving the landing', async ({ page }) => {
  await page.goto('/')
  await page.getByText('앱을 설치해야만 연습할 수 있나요?', { exact: true }).click()
  await expect(
    page.getByText('설치 없이 웹에서 로그인해 연습할 수 있어요.', { exact: false }),
  ).toBeVisible()
  await page.getByText('실제 사람에게 전화가 걸리나요?', { exact: true }).click()
  await expect(
    page.getByText('실제 사람에게 전화를 걸지 않고 대화를 연습할 수 있어요.', { exact: false }),
  ).toBeVisible()
  await expect(page.locator('#faq details')).toHaveCount(3)
  await expect(page).toHaveURL(/\/$/)
})

test('supports keyboard feature navigation and keeps the real feature destination for login', async ({
  page,
}) => {
  await page.goto('/')
  await expect(page.locator('.brand-page')).toHaveAttribute('data-brand-ready', 'true')
  const firstTab = page.getByRole('tab', { name: '상황 고르기', exact: true })
  await firstTab.focus()
  await firstTab.press('ArrowRight')
  const trainingTab = page.getByRole('tab', { name: 'AI 통화 연습', exact: true })
  await expect(trainingTab).toBeFocused()
  await expect(trainingTab).toHaveAttribute('aria-selected', 'true')
  await expect(page.getByRole('tabpanel')).toHaveCount(1)
  await page.getByRole('link', { name: '연습 시작하기', exact: true }).click()
  await expect(page).toHaveURL(/\/login$/)
  expect(await page.evaluate(() => window.history.state.usr.from)).toBe('/dashboard')
})

test('sends an existing session to the actual web service', async ({ page }) => {
  await page.route('**/api/v1/**', (route) => route.abort())
  await authenticate(page)
  await page.goto('/')
  const entry = page.getByRole('link', { name: '웹에서 시작하기', exact: true }).first()
  await expect(entry).toHaveAttribute('href', '/dashboard')
  await entry.click()
  await expect(page).toHaveURL(/\/dashboard$/)
  await expect(page.getByRole('navigation', { name: '주요 메뉴' })).toBeVisible()
  await expect(page.locator('html')).toHaveCSS('scrollbar-width', 'auto')
  await expect(page.locator('[data-scroll-lock-target]')).toHaveCSS('overflow-y', 'auto')
  await expect(page.locator('[data-scroll-lock-target]')).toHaveCSS('scrollbar-width', 'auto')
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
    await expect(
      navigation.getByRole('link', { name: '웹에서 시작하기', exact: true }),
    ).toBeVisible()
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
  const googlePlay = page.getByRole('link', { name: 'Google Play에서 BADA 다운로드 (새 탭)' })
  await expect(googlePlay.locator('img')).toHaveAttribute('src', /google-play-badge-ko\.png/)
  await expect(
    page.getByRole('link', { name: 'App Store에서 BADA 다운로드 (새 탭)' }).locator('img'),
  ).toHaveAttribute('src', /app-store-badge-ko\.png/)
  await expect(
    page.getByRole('region', { name: '편하게 말할 수 있는 내일을 만듭니다.' }),
  ).toHaveCount(1)
  await expect(googlePlay).toHaveAttribute(
    'href',
    'https://play.google.com/store/apps/details?id=com.chickenmayodeopbab.bada.play',
  )
  await expect
    .poll(() =>
      googlePlay
        .locator('img')
        .evaluate((image: HTMLImageElement) => image.complete && image.naturalWidth > 0),
    )
    .toBe(true)
  await expect(page.getByRole('link', { name: /ONE store/ })).toHaveCount(0)
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
