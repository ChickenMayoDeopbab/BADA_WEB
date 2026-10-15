import { expect, test, type Page } from '@playwright/test'
import { authenticate } from './authFixture'

/** 워밍업의 실제 서버 요청 순서를 기록하고 동의 상태·실패를 제어합니다. */
const prepareWarmup = async (page: Page, initialConsent: boolean) => {
  await page.route('**/api/v1/**', (route) => route.fulfill({ json: { data: {} } }))
  await authenticate(page)
  let agreed = initialConsent
  let failSave = false
  let failStatus = false
  let rejectSession = false
  const created: string[] = []
  const accepts: unknown[] = []
  const status = () => ({
    termsOfServiceAgreed: true,
    privacyPolicyAcknowledged: true,
    sensitiveInformationAgreed: agreed,
    profileImageAgreed: false,
    legalActionRequired: false,
  })
  await page.route('**/api/v1/legal-consents/status', (route) =>
    failStatus
      ? route.fulfill({ status: 503, json: { message: '동의 조회 오류' } })
      : route.fulfill({ json: { data: status() } }),
  )
  await page.route('**/api/v1/legal-consents/accept', (route) => {
    accepts.push(route.request().postDataJSON())
    if (failSave) return route.fulfill({ status: 503, json: { message: '동의 저장 오류' } })
    agreed = true
    return route.fulfill({ json: { data: status() } })
  })
  await page.route('**/api/v1/scenario/custom', (route) => {
    created.push('scenario')
    return route.fulfill({
      json: {
        scenario: { scenario_id: 81, title: '워밍업', content: '카페 영업시간을 물어보세요.' },
      },
    })
  })
  await page.route('**/api/v1/session', (route) => {
    created.push('session')
    if (rejectSession) {
      rejectSession = false
      return route.fulfill({
        status: 403,
        json: { error: { code: 'LEGAL_CONSENT_001', message: '민감정보 처리 동의가 필요합니다.' } },
      })
    }
    return route.fulfill({
      json: { data: { sessionId: 'warmup-81', wsUrl: 'ws://localhost/voice' } },
    })
  })
  await page.goto('/training/warmup')
  await page.getByRole('textbox', { name: '통화 상대', exact: true }).fill('카페 직원')
  await page.getByRole('textbox', { name: '통화 목적', exact: true }).fill('영업시간 문의하기')
  return {
    created,
    accepts,
    failSave: (value: boolean) => {
      failSave = value
    },
    failStatus: (value: boolean) => {
      failStatus = value
    },
    rejectSession: () => {
      rejectSession = true
    },
  }
}

test('does not create anything after declining consent and retries failed consent saving without changing other choices', async ({
  page,
}) => {
  const audit = await prepareWarmup(page, false)
  const start = page.getByRole('button', { name: '30초 워밍업 시작' })
  await start.click()
  const dialog = page.getByRole('dialog')
  await expect(dialog).toBeVisible()
  expect(audit.created).toEqual([])
  await dialog.getByRole('button', { name: '취소', exact: true }).click()
  await expect(start).toBeEnabled()
  expect(audit.created).toEqual([])
  await start.click()
  audit.failSave(true)
  await dialog.getByRole('button', { name: '동의하기', exact: true }).click()
  await expect(dialog.getByRole('alert')).toHaveText('동의 저장 오류')
  expect(audit.created).toEqual([])
  audit.failSave(false)
  await dialog.getByRole('button', { name: '동의하기', exact: true }).click()
  await expect(page).toHaveURL(/\/training\/81\/call$/)
  expect(audit.created).toEqual(['scenario', 'session'])
  expect(audit.accepts.at(-1)).toEqual({
    termsOfServiceAgreed: true,
    privacyPolicyAcknowledged: true,
    sensitiveInformationAgreed: true,
    profileImageAgreed: false,
  })
})

test('opens consent again on LEGAL_CONSENT_001 and reuses the created scenario', async ({
  page,
}) => {
  const audit = await prepareWarmup(page, true)
  audit.rejectSession()
  await page.getByRole('button', { name: '30초 워밍업 시작' }).click()
  await expect(page.getByRole('dialog')).toBeVisible()
  expect(audit.created).toEqual(['scenario', 'session'])
  await page.getByRole('dialog').getByRole('button', { name: '동의하기', exact: true }).click()
  await expect(page).toHaveURL(/\/training\/81\/call$/)
  expect(audit.created).toEqual(['scenario', 'session', 'session'])
})

test('stops before scenario creation if consent lookup fails and allows a retry', async ({
  page,
}) => {
  const audit = await prepareWarmup(page, true)
  audit.failStatus(true)
  await page.getByRole('button', { name: '30초 워밍업 시작' }).click()
  await expect(page.getByRole('alert').first()).toBeVisible()
  expect(audit.created).toEqual([])
  audit.failStatus(false)
  await page.getByRole('button', { name: '30초 워밍업 시작' }).click()
  await expect(page).toHaveURL(/\/training\/81\/call$/)
  expect(audit.created).toEqual(['scenario', 'session'])
})
