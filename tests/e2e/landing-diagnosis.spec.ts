import { expect, test, type Page } from '@playwright/test'

const questions = [
  {
    questionId: 12,
    content: '전화를 걸기 전에 긴장한 적이 있다.',
    orderIndex: 2,
    questionnaireVersion: 'LANDING-test-v1',
  },
  {
    questionId: 11,
    content: '모르는 번호의 전화를 피한 적이 있다.',
    orderIndex: 1,
    questionnaireVersion: 'LANDING-test-v1',
  },
]
const diagnosisResult = {
  score: 3.5,
  levelName: '나의 전화 습관',
  levelDescription: '일부 상황에서 전화가 부담스러울 수 있어요.',
  summary: '익숙한 상황부터 천천히 연습해보세요.',
}

/** 숨겨진 input 대신 사용자가 누르는 응답 라벨을 선택합니다. */
const chooseAnswer = async (page: Page, name: string) => {
  await page
    .locator('label')
    .filter({ has: page.getByRole('radio', { name, exact: true }) })
    .click()
}

test('completes public LANDING diagnosis after consent without login and preserves previous answers', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 })
  const memberRequests: string[] = []
  const questionRequests: string[] = []
  let submission: Record<string, unknown> | undefined
  await page.route('**/api/v1/**', (route) => {
    memberRequests.push(route.request().url())
    return route.abort()
  })
  await page.route('**/api/diagnosis/questions?*', (route) => {
    questionRequests.push(route.request().url())
    expect(route.request().headers().authorization).toBeUndefined()
    return route.fulfill({ json: { status: 200, data: questions } })
  })
  await page.route('**/api/diagnosis/submit', (route) => {
    expect(route.request().headers().authorization).toBeUndefined()
    submission = route.request().postDataJSON()
    return route.fulfill({ json: { status: 200, data: diagnosisResult } })
  })
  await page.goto('/')
  expect(questionRequests).toHaveLength(0)
  const start = page.getByRole('button', { name: '자가진단 시작하기', exact: true })
  await start.click()
  await page.getByRole('dialog').getByRole('button', { name: '나중에', exact: true }).click()
  expect(questionRequests).toHaveLength(0)
  await start.click()
  await page.getByRole('dialog').getByRole('button', { name: '동의하기', exact: true }).click()
  await expect(page.getByRole('heading', { name: questions[1].content })).toBeVisible()
  expect(new URL(questionRequests[0]).searchParams.get('type')).toBe('LANDING')
  await expect(page.getByRole('button', { name: '다음 문항', exact: true })).toBeDisabled()
  await chooseAnswer(page, '2점')
  await page.getByRole('button', { name: '다음 문항', exact: true }).click()
  await chooseAnswer(page, '자주 있다')
  await page.getByRole('button', { name: '이전 문항으로', exact: true }).click()
  await expect(page.getByRole('radio', { name: '2점', exact: true })).toBeChecked()
  await page.getByRole('button', { name: '다음 문항', exact: true }).click()
  await expect(page.getByRole('radio', { name: '자주 있다', exact: true })).toBeChecked()
  await page.getByRole('button', { name: '결과 확인하기', exact: true }).click()
  await expect(
    page.getByRole('heading', { name: diagnosisResult.levelName, exact: true }),
  ).toBeVisible()
  expect(submission).toMatchObject({
    type: 'LANDING',
    answers: [2, 5],
    questionnaireVersion: 'LANDING-test-v1',
  })
  expect(submission?.sessionId).toMatch(/^[0-9a-f-]{36}$/)
  expect(memberRequests).toEqual([])
  await expect(page).toHaveURL(/\/$/)
  await page.getByRole('button', { name: '다시 해보기', exact: true }).click()
  await expect(start).toBeVisible()
})

test('retries question loading and submission without changing the diagnosis session', async ({
  page,
}) => {
  let questionAttempts = 0
  const submissions: Record<string, unknown>[] = []
  await page.route('**/api/diagnosis/questions?*', (route) => {
    questionAttempts++
    return route.fulfill(
      questionAttempts === 1
        ? { status: 503, json: { message: '문항 조회 실패' } }
        : { json: { status: 200, data: questions.slice(1) } },
    )
  })
  await page.route('**/api/diagnosis/submit', (route) => {
    submissions.push(route.request().postDataJSON())
    return route.fulfill(
      submissions.length === 1
        ? { status: 503, json: { message: '제출을 처리하지 못했어요.' } }
        : { json: { status: 200, data: diagnosisResult } },
    )
  })
  await page.goto('/')
  await page.getByRole('button', { name: '자가진단 시작하기', exact: true }).click()
  await page.getByRole('dialog').getByRole('button', { name: '동의하기', exact: true }).click()
  await expect(page.getByRole('alert')).toHaveText('문항을 불러오지 못했어요.')
  await page.getByRole('button', { name: '다시 불러오기', exact: true }).click()
  await chooseAnswer(page, '전혀 없다')
  await page.getByRole('button', { name: '결과 확인하기', exact: true }).click()
  await expect(page.getByRole('alert')).toBeVisible()
  await page.getByRole('button', { name: '다시 시도하기', exact: true }).click()
  await expect(
    page.getByRole('heading', { name: diagnosisResult.levelName, exact: true }),
  ).toBeVisible()
  expect(submissions).toHaveLength(2)
  expect(submissions[1]).toEqual(submissions[0])
})
