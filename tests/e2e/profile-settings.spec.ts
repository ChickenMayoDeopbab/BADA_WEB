import { expect, test, type Page } from '@playwright/test'

/** 동의 제한을 실제 API 계약처럼 적용하고 업로드·저장·캐시 갱신을 계측합니다. */
const prepareProfile = async (page: Page, imageAgreed = false) => {
  await page.addInitScript(() => localStorage.setItem('bada.accessToken', 'profile-test-token'))
  const status = {
    termsOfServiceAgreed: true,
    privacyPolicyAcknowledged: true,
    sensitiveInformationAgreed: false,
    profileImageAgreed: imageAgreed,
    legalActionRequired: false,
  }
  const profile = {
    name: '변성우',
    username: 'b2ong222',
    email: 'profile@example.com',
    s3Key: '',
    level: 'LEVEL_2',
    levelName: '초급',
    trainCount: 0,
    attendance: 0,
  }
  const imageUrl =
    'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="32" height="32"%3E%3Ccircle cx="16" cy="16" r="16" fill="green"/%3E%3C/svg%3E'
  let uploads = 0
  let patches = 0
  let withdrawals = 0
  let profileReads = 0
  let failNextPatch = false
  const accepts: unknown[] = []
  await page.route('**/api/v1/**', async (route) => {
    const request = route.request()
    const url = new URL(request.url())
    const path = url.pathname
    if (path === '/api/v1/legal-consents/status') return route.fulfill({ json: status })
    if (path === '/api/v1/legal-consents/accept') {
      const payload = request.postDataJSON()
      accepts.push(payload)
      Object.assign(status, payload)
      return route.fulfill({ json: { data: status } })
    }
    if (request.method() === 'DELETE' && path.startsWith('/api/v1/legal-consents/')) {
      withdrawals++
      if (path.endsWith('profile-image')) status.profileImageAgreed = false
      else status.sensitiveInformationAgreed = false
      return route.fulfill({ json: { data: status } })
    }
    if (path === '/api/v1/user/mypage') {
      if (request.method() === 'PATCH') {
        patches++
        if (failNextPatch) {
          failNextPatch = false
          return route.fulfill({
            status: 500,
            json: { error: { message: '프로필 저장 테스트 오류' } },
          })
        }
        Object.assign(profile, request.postDataJSON())
        return route.fulfill({ json: { data: null } })
      }
      profileReads++
      return route.fulfill({ json: { data: profile } })
    }
    if (path === '/api/v1/file/upload') {
      if (!status.profileImageAgreed)
        return route.fulfill({
          status: 403,
          json: { message: '프로필 이미지 처리 동의가 필요합니다.' },
        })
      expect(url.searchParams.get('fileType')).toBe('PROFILE')
      expect(request.headers()['content-type']).toContain('multipart/form-data; boundary=')
      expect(request.postDataBuffer()?.toString()).toContain('filename="profile.png"')
      uploads++
      return route.fulfill({
        json: { data: { fileId: 1, s3Key: 'profile/saved.png', url: imageUrl } },
      })
    }
    if (path === '/api/v1/file') return route.fulfill({ json: { data: { url: imageUrl } } })
    if (path === '/api/v1/notifications/settings')
      return route.fulfill({
        json: {
          data:
            request.method() === 'PUT'
              ? request.postDataJSON()
              : { allEnabled: true, communityEnabled: true, trainingEnabled: true },
        },
      })
    if (path === '/api/v1/ringtones')
      return route.fulfill({
        json: { data: [{ fileId: 7, title: '잔잔한 파도', url: '/wave.mp3' }] },
      })
    if (path === '/api/v1/ringtones/settings')
      return route.fulfill({ json: { data: { fileId: null, defaultRingtone: true } } })
    if (path === '/api/v1/training-records')
      return route.fulfill({ json: { data: { content: [] } } })
    return route.fulfill({ json: { data: {} } })
  })
  return {
    status,
    profile,
    accepts,
    imageUrl,
    uploads: () => uploads,
    patches: () => patches,
    withdrawals: () => withdrawals,
    profileReads: () => profileReads,
    failPatch: () => {
      failNextPatch = true
    },
  }
}

/** 브라우저에서 선택 가능한 작은 PNG 파일입니다. */
const photo = {
  name: 'profile.png',
  mimeType: 'image/png',
  buffer: Buffer.from(
    'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+a3ioAAAAASUVORK5CYII=',
    'base64',
  ),
}

test('requires explicit image consent, cancels without uploading, and refreshes the saved avatar', async ({
  page,
}) => {
  const api = await prepareProfile(page)
  await page.goto('/profile/edit')
  await expect(page.getByRole('textbox', { name: '이메일' })).toBeDisabled()
  await page.locator('input[type=file]').setInputFiles(photo)
  await page.getByRole('button', { name: '변경사항 저장' }).click()
  const dialog = page.getByRole('dialog', { name: '프로필 이미지 처리에 동의할까요?' })
  await expect(dialog).toBeVisible()
  await expect(dialog).toContainText('보유 기간')
  await page.setViewportSize({ width: 390, height: 844 })
  await page.screenshot({ path: 'test-results/profile-image-consent-mobile.png' })
  const dialogBox = await dialog.boundingBox()
  expect(dialogBox!.x).toBeGreaterThanOrEqual(0)
  expect(dialogBox!.x + dialogBox!.width).toBeLessThanOrEqual(390)
  expect(dialogBox!.y + dialogBox!.height).toBeLessThanOrEqual(844)
  await page.setViewportSize({ width: 1280, height: 720 })
  await dialog.getByRole('button', { name: '취소', exact: true }).click()
  expect(api.uploads()).toBe(0)
  expect(api.patches()).toBe(0)
  await page.getByRole('button', { name: '변경사항 저장' }).click()
  await dialog.getByRole('button', { name: '동의하고 저장' }).click()
  await expect(page).toHaveURL(/\/profile$/)
  expect(api.accepts).toEqual([
    {
      termsOfServiceAgreed: true,
      privacyPolicyAcknowledged: true,
      sensitiveInformationAgreed: false,
      profileImageAgreed: true,
    },
  ])
  expect(api.uploads()).toBe(1)
  expect(api.profile.s3Key).toBe('profile/saved.png')
  await expect(page.getByRole('img', { name: '변성우 프로필' }).first()).toHaveAttribute(
    'src',
    api.imageUrl,
  )
  expect(api.profileReads()).toBeGreaterThan(2)
})

test('shows the server save error and reuses the uploaded image when retrying profile save', async ({
  page,
}) => {
  const api = await prepareProfile(page, true)
  api.failPatch()
  await page.goto('/profile/edit')
  await page.locator('input[type=file]').setInputFiles(photo)
  await page.getByRole('button', { name: '변경사항 저장' }).click()
  await expect(page.getByRole('alert')).toHaveText('프로필 저장 테스트 오류')
  expect(api.uploads()).toBe(1)
  await page.getByRole('button', { name: '변경사항 저장' }).click()
  await expect(page).toHaveURL(/\/profile$/)
  expect(api.uploads()).toBe(1)
  expect(api.patches()).toBe(2)
})

test('copies app privacy documents, animates one accordion, and preserves other optional consent choices', async ({
  page,
}) => {
  const api = await prepareProfile(page)
  await page.goto('/profile/privacy')
  const profileDocument = page.getByRole('button', { name: '프로필 이미지 처리 안내', exact: true })
  await profileDocument.click()
  const region = page.getByRole('region', { name: '프로필 이미지 처리 안내' })
  await expect(region).toContainText(
    '회원 탈퇴 또는 프로필 이미지 처리 동의 철회 시까지 보관합니다.',
  )
  await expect(region).toHaveCSS('transition-duration', '0.4s')
  await expect(region).toHaveCSS('opacity', '1')
  await expect.poll(async () => (await region.boundingBox())?.height ?? 0).toBeGreaterThan(100)
  await page.screenshot({ path: 'test-results/profile-privacy.png' })
  await page.getByRole('button', { name: '서비스 이용약관', exact: true }).click()
  await expect(profileDocument).toHaveAttribute('aria-expanded', 'false')
  const imageConsent = page.getByRole('region', { name: '프로필 이미지 처리 동의', exact: true })
  await imageConsent.getByRole('button', { name: '동의하기', exact: true }).click()
  await expect(imageConsent.getByRole('button', { name: '동의 철회하기' })).toBeEnabled()
  expect(api.status.sensitiveInformationAgreed).toBe(false)
  const sensitiveConsent = page.getByRole('region', { name: '민감정보 처리 동의', exact: true })
  await sensitiveConsent.getByRole('button', { name: '동의하기', exact: true }).click()
  await expect(sensitiveConsent.getByRole('button', { name: '동의 철회하기' })).toBeEnabled()
  expect(api.status.profileImageAgreed).toBe(true)
  await imageConsent.getByRole('button', { name: '동의 철회하기' }).click()
  let dialog = page.getByRole('dialog')
  await dialog.getByRole('button', { name: '취소', exact: true }).click()
  expect(api.withdrawals()).toBe(0)
  await imageConsent.getByRole('button', { name: '동의 철회하기' }).click()
  dialog = page.getByRole('dialog')
  await dialog.getByRole('button', { name: '철회하기', exact: true }).click()
  await expect(imageConsent.getByRole('button', { name: '동의하기', exact: true })).toBeEnabled()
  expect(api.status.sensitiveInformationAgreed).toBe(true)
  await sensitiveConsent.getByRole('button', { name: '동의 철회하기' }).click()
  await page.getByRole('dialog').getByRole('button', { name: '철회하기', exact: true }).click()
  await expect(
    sensitiveConsent.getByRole('button', { name: '동의하기', exact: true }),
  ).toBeEnabled()
  expect(api.withdrawals()).toBe(2)
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await profileDocument.click()
  await expect(page.getByRole('region', { name: '프로필 이미지 처리 안내' })).toHaveCSS(
    'transition-property',
    'none',
  )
})

test('animates ringtone hover and selection colors and moves notification toggles smoothly', async ({
  page,
}) => {
  await prepareProfile(page)
  await page.goto('/profile/ringtone')
  const radio = page.getByRole('radio', { name: /잔잔한 파도/ })
  const ringtone = radio.locator('../..')
  const originalColor = await ringtone.evaluate(
    (element) => getComputedStyle(element).backgroundColor,
  )
  await ringtone.hover()
  await expect
    .poll(() => ringtone.evaluate((element) => getComputedStyle(element).backgroundColor))
    .not.toBe(originalColor)
  await expect(ringtone).toHaveCSS('transition-duration', '0.4s')
  await radio.check()
  await page.mouse.move(0, 0)
  await expect(ringtone).toHaveCSS('background-color', 'rgba(10, 227, 101, 0.2)')
  await page.goto('/profile/notifications')
  const toggle = page.getByRole('button', { name: /전체 알림/ })
  const thumb = toggle.locator('span')
  await expect(thumb).toHaveCSS('translate', '16px')
  await toggle.click()
  await expect(thumb).toHaveCSS('translate', '0px')
  await expect
    .poll(() => thumb.evaluate((element) => getComputedStyle(element).transitionProperty))
    .toContain('translate')
  await expect(thumb).toHaveCSS('transition-duration', '0.35s')
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await expect(thumb).toHaveCSS('transition-property', 'none')
})
