import { expect, test } from '@playwright/test'
import { authenticate } from './authFixture'

test.beforeEach(async ({ page }) => { await authenticate(page) })

test('only deletes owned custom copies after confirmation and retains the dialog on failure', async ({
  page,
}) => {
  let deleted = false
  let attempts = 0
  const basic = {
    scenario_id: 1,
    title: '기본 예약',
    category: 'daily',
    is_custom: false,
    content: '예약 훈련',
  }
  const copied = {
    scenario_id: 22,
    title: '가져온 예약',
    category: 'daily',
    is_custom: true,
    is_copied: true,
    content: '내 목록의 사본',
  }
  await page.route('**/api/v1/users/me', (route) => route.fulfill({ json: { data: {} } }))
  await page.route('**/api/v1/training-call-schedules/ringing', (route) =>
    route.fulfill({ json: { status: 200 } }),
  )
  await page.route('**/api/v1/scenario/scenarios', (route) =>
    route.fulfill({ json: { scenarios: deleted ? [basic] : [basic, copied] } }),
  )
  await page.route('**/api/v1/scenario/recommendation', (route) =>
    route.fulfill({ json: { scenario: basic, reason: 'NOT_PRACTICED' } }),
  )
  await page.route('**/api/v1/scenario/*/example', (route) =>
    route.fulfill({ json: { dialogue: [], audio_url: null } }),
  )
  await page.route('**/api/v1/scenario/custom/22', (route) => {
    attempts += 1
    deleted = attempts > 1
    return route.fulfill(
      deleted ? { status: 204 } : { status: 503, json: { detail: '삭제에 실패했어요.' } },
    )
  })
  await page.goto('/training')
  await page.getByRole('button', { name: '기본 예약 상세 보기', exact: true }).click()
  await expect(page.getByRole('button', { name: '시나리오 메뉴 열기', exact: true })).toHaveCount(0)
  await page
    .getByRole('dialog')
    .getByRole('button', { name: '시나리오 상세 닫기', exact: true })
    .click()
  await page.getByRole('tab', { name: '공유됨', exact: true }).click()
  await page.getByRole('button', { name: '가져온 예약 상세 보기', exact: true }).click()
  await page.getByRole('button', { name: '시나리오 메뉴 열기', exact: true }).click()
  await page.getByRole('button', { name: '시나리오 삭제하기', exact: true }).click()
  expect(attempts).toBe(0)
  await page.getByRole('alertdialog').getByRole('button', { name: '삭제하기', exact: true }).click()
  await expect(page.getByRole('alertdialog')).toContainText('삭제에 실패했어요.')
  await page.getByRole('alertdialog').getByRole('button', { name: '삭제하기', exact: true }).click()
  await expect(page.getByRole('alertdialog')).toHaveCount(0)
  await expect(
    page.getByRole('button', { name: '가져온 예약 상세 보기', exact: true }),
  ).toHaveCount(0)
  expect(attempts).toBe(2)
})

test('retries custom creation, retains inputs and starts a CUSTOM training session', async ({
  page,
}) => {
  let attempts = 0
  let created = false
  const basic = {
    scenario_id: 1,
    title: '음식점 예약',
    content: '식당에 예약합니다.',
    category: 'daily',
    is_custom: false,
    practice_count: 0,
  }
  const custom = {
    scenario_id: 20,
    title: '내 예약 변경',
    content: '예약한 날짜를 변경합니다.',
    category: 'daily',
    is_custom: true,
    practice_count: 0,
  }
  await page.route('**/api/v1/users/me', (route) => route.fulfill({ json: { data: {} } }))
  await page.route('**/api/v1/training-call-schedules/ringing', (route) =>
    route.fulfill({ json: { data: null } }),
  )
  await page.route('**/api/v1/scenario/scenarios', (route) =>
    route.fulfill({ json: { scenarios: created ? [basic, custom] : [basic] } }),
  )
  await page.route('**/api/v1/scenario/recommendation', (route) =>
    route.fulfill({ json: { scenario: created ? custom : basic, reason: 'CUSTOM_NOT_PRACTICED' } }),
  )
  await page.route('**/api/v1/scenario/custom', (route) => {
    attempts += 1
    expect(route.request().postDataJSON()).toEqual({
      title: '내 예약 변경',
      category: 'daily',
      call_target: '식당 예약 직원',
      call_purpose: '저녁 예약 날짜를 변경하고 싶어요.',
      personality: 'NORMAL',
      difficulty: 'medium',
      is_warmup: false,
    })
    created = attempts > 1
    return route.fulfill({
      status: created ? 201 : 503,
      json: created
        ? {
            scenario: {
              scenario_id: 20,
              title: custom.title,
              content: custom.content,
              ai_prompt: 'internal',
              tts_voice_id: null,
              script: [],
            },
            created_at: new Date().toISOString(),
          }
        : { detail: '잠시 후 다시 시도해 주세요.' },
    })
  })
  await page.route('**/api/v1/session', (route) => {
    expect(route.request().postDataJSON()).toEqual({
      scenarioId: 20,
      type: 'CUSTOM',
      aiPersonality: 'KIND',
      difficulty: 'low',
    })
    return route.fulfill({
      json: { data: { sessionId: 'custom-session', wsUrl: 'ws://internal/ignored' } },
    })
  })
  await page.goto('/training')
  await page.getByRole('tab', { name: '커스텀', exact: true }).click()
  await page.getByRole('button', { name: /나만의 시나리오 만들기/ }).click()
  await page.getByRole('button', { name: '카테고리', exact: true }).click()
  await page.getByRole('button', { name: '일상', exact: true }).click()
  await page.getByRole('textbox', { name: '시나리오 제목' }).fill('내 예약 변경')
  await page.getByRole('button', { name: '다음으로', exact: true }).click()
  await page.getByRole('textbox', { name: '전화 상대' }).fill('식당 예약 직원')
  await page.getByRole('textbox', { name: '전화 목적' }).fill('저녁 예약 날짜를 변경하고 싶어요.')
  await page.getByRole('button', { name: '시나리오 생성하기', exact: true }).click()
  await expect(page.getByText('잠시 후 다시 시도해 주세요.', { exact: true })).toBeVisible()
  await page.getByRole('button', { name: '다시 시도하기', exact: true }).click()
  await expect(page.getByRole('textbox', { name: '전화 상대' })).toHaveValue('식당 예약 직원')
  await page.getByRole('button', { name: '시나리오 생성하기', exact: true }).click()
  await page.getByRole('button', { name: '훈련 바로 시작하기', exact: true }).click()
  await expect(page).toHaveURL(/\/training\/20\/settings/)
  await page.getByRole('button', { name: '다음으로', exact: true }).click()
  await page.getByRole('button', { name: '설정 완료하기', exact: true }).click()
  await expect(page.getByRole('button', { name: '전화 받기', exact: true })).toBeVisible()
  expect(attempts).toBe(2)
})
