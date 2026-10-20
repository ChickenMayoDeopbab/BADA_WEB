import { expect, test } from '@playwright/test'

test('switches between the three Figma script modes on the same moving phone and preserves the choice', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1280, height: 900 })
  await page.goto('/')
  await expect(page.locator('.brand-page')).toHaveAttribute('data-brand-ready', 'true')
  await page.getByRole('tab', { name: 'AI 통화 연습', exact: true }).click()
  await expect
    .poll(() =>
      page
        .locator('#experience')
        .evaluate((element) =>
          Number((element as HTMLElement).style.getPropertyValue('--tour-progress')),
        ),
    )
    .toBeCloseTo(0.5, 2)
  const options = page.getByRole('group', { name: '통화 도움 방식', exact: true })
  const script = page.locator('.brand-tour-screen[data-current="true"] .app-call-script')
  await expect(script).toHaveAttribute('data-figma-node', '6097:6850')
  await expect(options.getByRole('button')).toHaveText(['추천 문장', '조언', '힌트 없이'])
  await options.getByRole('button', { name: '조언', exact: true }).click()
  await expect(script).toHaveAttribute('data-figma-node', '6097:6878')
  await options.getByRole('button', { name: '추천 문장', exact: true }).click()
  await expect(script).toHaveAttribute('data-figma-node', '6097:6850')
  await expect(script).toContainText('추천 : 그러면 (메뉴명)으로 주문하겠습니다.')
  await expect(page.locator('[data-tour-callout]')).toContainText(
    '다음 한마디가 어렵다면 문장을 참고해요.',
  )
  await options.getByRole('button', { name: '힌트 없이', exact: true }).click()
  await expect(script).toHaveAttribute('data-figma-node', '6097:6825')
  await expect(script.locator('.app-call-hint')).toHaveCount(0)
  await page.getByRole('tab', { name: '돌아보기', exact: true }).click()
  await page.getByRole('tab', { name: 'AI 통화 연습', exact: true }).click()
  await expect(options.getByRole('button', { name: '힌트 없이', exact: true })).toHaveAttribute(
    'aria-pressed',
    'true',
  )
  await expect
    .poll(() =>
      page
        .locator('#experience')
        .evaluate((element) =>
          Number((element as HTMLElement).style.getPropertyValue('--tour-progress')),
        ),
    )
    .toBeCloseTo(0.5, 2)
  await page.getByRole('tab', { name: 'AI 통화 연습', exact: true }).click()
  await options.getByRole('button', { name: '조언', exact: true }).click()
  await expect(script).toHaveAttribute('data-figma-node', '6097:6878')
  await expect(page.locator('[data-tour-device]')).toHaveCount(1)
})
