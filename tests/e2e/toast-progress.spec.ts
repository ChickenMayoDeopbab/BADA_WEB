import { expect, test, type Page } from '@playwright/test'
import { authenticate } from './authFixture'

/** 알림 설정 저장 결과로 실제 공통 토스트를 표시합니다. */
const showToast = async (page: Page) => {
  await page.route('**/api/v1/**', (route) => route.fulfill({ json: { data: {} } }))
  await authenticate(page)
  await page.route('**/api/v1/notifications/settings', (route) =>
    route.fulfill({
      json: {
        data:
          route.request().method() === 'PUT'
            ? route.request().postDataJSON()
            : { allEnabled: true, communityEnabled: true, trainingEnabled: true },
      },
    }),
  )
  await page.goto('/profile/notifications')
  await page.getByRole('button', { name: /전체 알림/ }).click()
  const toast = page.locator('[data-toast-state]')
  await expect(toast.getByRole('status')).toHaveText('알림 설정을 저장했어요.')
  return toast
}

test('shows a 2.5-second bar, pauses it on hover, resumes, then slides out to the right', async ({
  page,
}) => {
  const toast = await showToast(page)
  const progress = toast.locator('[data-toast-progress]')
  await expect(progress).toHaveCSS('animation-duration', '2.5s')
  const scale = () =>
    progress.evaluate((element) => new DOMMatrix(getComputedStyle(element).transform).m11)
  await expect.poll(scale).toBeLessThan(0.85)
  await toast.hover()
  await expect(progress).toHaveCSS('animation-play-state', 'paused')
  await progress.evaluate(async (element) => {
    await Promise.all(element.getAnimations().map((animation) => animation.ready))
  })
  const paused = await scale()
  await page.waitForTimeout(200)
  expect(await scale()).toBeCloseTo(paused, 2)
  await toast.screenshot({ path: test.info().outputPath('toast-countdown.png') })
  const audit = await toast.evaluateHandle((element) => {
    const result = { started: false, moved: false, finished: false, staysWithinViewport: true }
    element.addEventListener('animationstart', (event) => {
      if ((event as AnimationEvent).animationName !== 'ux-toast-exit') return
      result.started = true
      requestAnimationFrame(() =>
        requestAnimationFrame(() => {
          result.moved = new DOMMatrix(getComputedStyle(element).transform).m41 > 0
          result.staysWithinViewport = document.documentElement.scrollWidth <= window.innerWidth
        }),
      )
    })
    element.addEventListener('animationend', (event) => {
      if ((event as AnimationEvent).animationName === 'ux-toast-exit') result.finished = true
    })
    return result
  })
  await page.mouse.move(1, 1)
  await expect(progress).toHaveCSS('animation-play-state', 'running')
  await expect(toast).toHaveCount(0)
  await expect.poll(() => audit.jsonValue()).toMatchObject({ started: true, moved: true })
  expect((await audit.jsonValue()).staysWithinViewport).toBe(true)
})

test('skips the exit motion when reduced motion is preferred', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  const toast = await showToast(page)
  await expect(toast.locator('[data-toast-progress]')).toHaveCSS('animation-duration', '2.5s')
  const audit = await toast.evaluateHandle((element) => {
    const result = { animated: false }
    element.addEventListener('animationstart', (event) => {
      if ((event as AnimationEvent).animationName === 'ux-toast-exit') result.animated = true
    })
    return result
  })
  await toast.getByRole('button', { name: '알림 닫기' }).click()
  await expect(toast).toHaveCount(0)
  expect((await audit.jsonValue()).animated).toBe(false)
})
