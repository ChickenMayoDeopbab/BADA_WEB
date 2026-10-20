import { expect, test } from '@playwright/test'

test('introduces the team in a full-screen section reachable from desktop and mobile navigation', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  for (const viewport of [
    { width: 320, height: 568 },
    { width: 390, height: 844 },
    { width: 844, height: 390 },
    { width: 1280, height: 900 },
  ]) {
    await page.setViewportSize(viewport)
    await page.goto('/#faq')
    const navigation = page.getByRole('navigation', { name: '페이지 구간', exact: true })
    if (viewport.width < 768) {
      await navigation.getByRole('button').click()
      await expect(navigation.getByRole('button')).toContainText('/ 06')
    }
    const teamLink = navigation.getByRole('link', { name: '팀·서비스 소개', exact: true })
    await teamLink.click()
    await expect(page).toHaveURL(/#team$/)
    const section = page.locator('#team')
    await expect(section.getByRole('heading', { level: 2 })).toBeInViewport()
    await expect(navigation.locator('a[href="#team"]')).toHaveAttribute('aria-current', 'location')
    expect((await section.boundingBox())!.height).toBeGreaterThanOrEqual(viewport.height)
    await expect(section.getByRole('img', { name: 'BADA', exact: true })).toBeVisible()
    await expect(section.getByRole('link', { name: '팀 GitHub', exact: true })).toHaveAttribute(
      'href',
      'https://github.com/orgs/ChickenMayoDeopbab',
    )
    for (const link of await section.getByRole('link').all()) {
      await link.scrollIntoViewIfNeeded()
      await expect(link).toBeInViewport({ ratio: 1 })
    }
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(viewport.width)
  }
})
