import { expect, test, type Page, type WebSocketRoute } from '@playwright/test'

test.use({
  launchOptions: { args: ['--use-fake-device-for-media-stream', '--use-fake-ui-for-media-stream'] },
})

declare global {
  interface Window {
    badaAudioAudit: { contexts: AudioContext[]; streams: MediaStream[] }
  }
}

/** 네트워크만 대체하고 실제 브라우저 마이크·AudioContext·Worklet을 계측합니다. */
const prepareCall = async (page: Page) => {
  const errors: string[] = []
  page.on('pageerror', (error) => errors.push(error.message))
  await page.addInitScript(() => {
    localStorage.setItem('bada.accessToken', 'test-access-token')
    window.badaAudioAudit = { contexts: [], streams: [] }
    const OriginalContext = window.AudioContext
    window.AudioContext = class extends OriginalContext {
      constructor(options?: AudioContextOptions) {
        super(options)
        window.badaAudioAudit.contexts.push(this)
      }
    }
    const getUserMedia = navigator.mediaDevices.getUserMedia.bind(navigator.mediaDevices)
    navigator.mediaDevices.getUserMedia = async (constraints) => {
      const stream = await getUserMedia(constraints)
      window.badaAudioAudit.streams.push(stream)
      return stream
    }
  })
  const scenario = {
    scenario_id: 1,
    title: '상담 예약하기',
    content: '상담 예약 전화를 연습합니다.',
    category: 'daily',
    is_custom: false,
  }
  await page.route('**/api/v1/scenario/scenarios', (route) =>
    route.fulfill({ json: { scenarios: [scenario] } }),
  )
  await page.route('**/api/v1/scenario/recommendation', (route) =>
    route.fulfill({ json: { scenario } }),
  )
  await page.route('**/api/v1/users/me', (route) => route.fulfill({ json: { data: {} } }))
  await page.route('**/api/v1/training-call-schedules/ringing', (route) =>
    route.fulfill({ json: { data: null } }),
  )
  await page.route('**/api/v1/ringtones/settings', (route) =>
    route.fulfill({ json: { data: { defaultRingtone: false, url: null } } }),
  )
  let sessions = 0
  await page.route('**/api/v1/session', async (route) => {
    expect(route.request().postDataJSON()).toEqual({
      scenarioId: 1,
      type: 'SCENARIO',
      aiPersonality: 'KIND',
      difficulty: 'low',
    })
    sessions += 1
    await route.fulfill({
      json: {
        data: {
          sessionId: `browser-session-${sessions}`,
          wsUrl: 'ws://internal-host:8000/ignored',
        },
      },
    })
  })
  const messages: Array<{ type: string; muted?: boolean; turn_id?: number; at: number }> = []
  const binaryFrames: Buffer[] = []
  let socket: WebSocketRoute | undefined
  let isServerMuted = false
  let binaryWhileMuted = 0
  let closed = 0
  await page.routeWebSocket('**/ws/voice/*', (route) => {
    socket = route
    expect(new URL(route.url()).searchParams.has('token')).toBe(false)
    route.onClose(() => {
      closed += 1
    })
    route.onMessage((message) => {
      if (typeof message !== 'string') {
        binaryFrames.push(message)
        if (isServerMuted) binaryWhileMuted += 1
        return
      }
      const frame = JSON.parse(message)
      messages.push({ ...frame, at: Date.now() })
      if (frame.type === 'auth') {
        expect(frame.token).toBe('test-access-token')
        route.send(JSON.stringify({ type: 'scenario_info', aiRole: '상담 직원', scriptLevel: 1 }))
      }
      if (frame.type === 'mute') isServerMuted = frame.muted
      if (frame.type === 'ping') route.send(JSON.stringify({ type: 'pong' }))
      if (frame.type === 'end') route.send(JSON.stringify({ type: 'end', reason: 'USER_END' }))
    })
  })
  return {
    errors,
    messages,
    binaryFrames,
    getSocket: () => socket!,
    getBinaryWhileMuted: () => binaryWhileMuted,
    getClosed: () => closed,
    getSessionCount: () => sessions,
  }
}

/** 실제 설정·수신·수락 동작으로 통화 준비를 시작합니다. */
const startCall = async (page: Page, shouldNavigate = true) => {
  if (shouldNavigate) await page.goto('/training/1/settings')
  await page.getByRole('button', { name: '다음으로', exact: true }).click()
  await page.getByRole('button', { name: '설정 완료하기', exact: true }).click()
  await page.getByRole('button', { name: '전화 받기', exact: true }).click()
  await page.getByRole('button', { name: '건너뛰기', exact: true }).click()
}

/** 1초짜리 16kHz PCM 응답을 여러 청크와 명시적인 완료 프레임으로 보냅니다. */
const sendAiTurn = (socket: WebSocketRoute, turnId: number) => {
  socket.send(JSON.stringify({ type: 'emotion', value: 'neutral' }))
  socket.send(
    JSON.stringify({ type: 'transcript', role: 'ai', text: '원하시는 날짜를 말씀해 주세요.' }),
  )
  for (let chunk = 0; chunk < 4; chunk += 1) {
    const buffer = Buffer.alloc(8000)
    for (let index = 0; index < 4000; index += 1)
      buffer.writeInt16LE(
        Math.round(Math.sin((index * 2 * Math.PI * 440) / 16000) * 3000),
        index * 2,
      )
    socket.send(buffer)
  }
  socket.send(JSON.stringify({ type: 'speaking_end', turn_id: turnId }))
}

test('streams real browser PCM, drains multi-chunk TTS, gates echo and cleans repeated calls', async ({
  page,
}) => {
  const audit = await prepareCall(page)
  await startCall(page)
  await expect(page.getByRole('heading', { name: '상담 직원' })).toBeVisible()
  await expect.poll(() => audit.binaryFrames.length).toBeGreaterThan(2)
  expect(audit.binaryFrames.every((frame) => frame.byteLength === 640)).toBe(true)
  expect(audit.messages.some((message) => message.type === 'playback_capabilities')).toBe(true)

  audit
    .getSocket()
    .send(
      JSON.stringify({ type: 'transcript', role: 'user', text: '내일 오후에 예약하고 싶어요.' }),
    )
  await page.getByRole('button', { name: '스크립트 보기', exact: true }).click()
  await expect(page.getByText('내일 오후에 예약하고 싶어요.', { exact: false })).toBeVisible()
  const sentAt = Date.now()
  sendAiTurn(audit.getSocket(), 1)
  await expect(
    page.getByRole('status').filter({ hasText: '상대방이 말하고 있어요.' }),
  ).toBeVisible()
  await expect
    .poll(
      () =>
        audit.messages.find((message) => message.type === 'playback_done' && message.turn_id === 1),
      { timeout: 5000 },
    )
    .toBeTruthy()
  const completedAt = audit.messages.find(
    (message) => message.type === 'playback_done' && message.turn_id === 1,
  )!.at
  expect(completedAt - sentAt).toBeGreaterThan(850)
  await expect(page.getByRole('status').filter({ hasText: '편하게 말씀해 주세요.' })).toBeVisible()
  expect(
    audit.messages.filter((message) => message.type === 'mute' && message.muted === false).at(-1)!
      .at - completedAt,
  ).toBeGreaterThanOrEqual(250)
  expect(audit.getBinaryWhileMuted()).toBe(0)

  await page.screenshot({ path: test.info().outputPath('call-active.png'), fullPage: true })

  await page.getByRole('button', { name: '음소거', exact: true }).click()
  sendAiTurn(audit.getSocket(), 2)
  await expect
    .poll(() =>
      audit.messages.some((message) => message.type === 'playback_done' && message.turn_id === 2),
    )
    .toBe(true)
  await page.waitForTimeout(400) // 재생 완료와 300ms 잔향 이후에도 사용자 음소거는 유지되어야 합니다.
  expect(audit.messages.filter((message) => message.type === 'mute').at(-1)?.muted).toBe(true)
  await page.getByRole('button', { name: '음소거', exact: true }).click()
  await expect
    .poll(() => audit.messages.filter((message) => message.type === 'mute').at(-1)?.muted)
    .toBe(false)
  await page.getByRole('button', { name: '통화 종료', exact: true }).click()
  await expect(page).toHaveURL(/\/training\/1\/result/)
  await expect
    .poll(() =>
      page.evaluate(
        () =>
          window.badaAudioAudit.contexts.every((context) => context.state === 'closed') &&
          window.badaAudioAudit.streams.every((stream) =>
            stream.getTracks().every((track) => track.readyState === 'ended'),
          ),
      ),
    )
    .toBe(true)
  expect(audit.getClosed()).toBe(1)
  expect(audit.errors).toEqual([])

  await page.goBack()
  await startCall(page, false)
  await expect(page.getByRole('heading', { name: '상담 직원' })).toBeVisible()
  await page.getByRole('button', { name: '통화 종료', exact: true }).click()
  await expect(page).toHaveURL(/\/training\/1\/result/)
  expect(await page.evaluate(() => window.badaAudioAudit.contexts.length)).toBe(2)
  await expect
    .poll(() =>
      page.evaluate(() =>
        window.badaAudioAudit.contexts.every((context) => context.state === 'closed'),
      ),
    )
    .toBe(true)
})

test('shows permission denial without creating a voice connection or a successful result', async ({
  page,
}) => {
  const audit = await prepareCall(page)
  await page.addInitScript(() => {
    navigator.mediaDevices.getUserMedia = () =>
      Promise.reject(new DOMException('denied', 'NotAllowedError'))
  })
  await startCall(page)
  await expect(page.getByRole('alert')).toContainText('마이크 권한')
  expect(audit.messages).toEqual([])
  expect(
    await page.evaluate(() =>
      window.badaAudioAudit.contexts.every((context) => context.state === 'closed'),
    ),
  ).toBe(true)
  await expect(page.getByRole('button', { name: '새 훈련 시작' })).toBeVisible()
})

test('cleans the microphone and output when navigating away during a call', async ({ page }) => {
  const audit = await prepareCall(page)
  await startCall(page)
  await expect.poll(() => audit.binaryFrames.length).toBeGreaterThan(0)
  sendAiTurn(audit.getSocket(), 1)
  await page.goBack()
  await expect(page).toHaveURL(/\/training\/1\/settings/)
  await expect
    .poll(() =>
      page.evaluate(
        () =>
          window.badaAudioAudit.contexts.every((context) => context.state === 'closed') &&
          window.badaAudioAudit.streams.every((stream) =>
            stream.getTracks().every((track) => track.readyState === 'ended'),
          ),
      ),
    )
    .toBe(true)
  expect(audit.getClosed()).toBe(1)
})

test('recovers browser audio suspension with a user gesture', async ({ page }) => {
  const audit = await prepareCall(page)
  await startCall(page)
  await expect.poll(() => audit.binaryFrames.length).toBeGreaterThan(0)
  await page.evaluate(() => window.badaAudioAudit.contexts[0].suspend())
  await expect(page.getByRole('button', { name: '음성 활성화' })).toBeVisible()
  const count = audit.binaryFrames.length
  await page.waitForTimeout(150) // 정지된 오디오에서 입력이 계속 전송되지 않는지 확인합니다.
  expect(audit.binaryFrames).toHaveLength(count)
  await page.getByRole('button', { name: '음성 활성화' }).click()
  await expect.poll(() => audit.binaryFrames.length).toBeGreaterThan(count)
  await page.getByRole('button', { name: '통화 종료', exact: true }).click()
  await expect(page).toHaveURL(/\/training\/1\/result/)
})

test('stops all audio after an abnormal server close', async ({ page }) => {
  const audit = await prepareCall(page)
  await startCall(page)
  await expect.poll(() => audit.binaryFrames.length).toBeGreaterThan(0)
  await audit.getSocket().close({ code: 1011 })
  await expect(page.getByRole('alert')).toContainText('연결이 끊어졌어요')
  await expect
    .poll(() =>
      page.evaluate(
        () =>
          window.badaAudioAudit.contexts.every((context) => context.state === 'closed') &&
          window.badaAudioAudit.streams.every((stream) =>
            stream.getTracks().every((track) => track.readyState === 'ended'),
          ),
      ),
    )
    .toBe(true)
  await expect(page).toHaveURL(/\/training\/1\/call/)
})

test('creates a scheduled session only when the incoming call is due', async ({ page }) => {
  const audit = await prepareCall(page)
  await page.addInitScript(() => {
    history.replaceState(
      {
        ...history.state,
        usr: {
          scenario: { scenarioId: 1, title: '상담 예약하기', category: 'daily' },
          sessionConfiguration: {
            scenarioId: 1,
            type: 'SCENARIO',
            aiPersonality: 'KIND',
            difficulty: 'low',
          },
          callDelaySeconds: 1,
        },
      },
      '',
    )
  })
  await page.goto('/training/1/call')
  await expect(page.getByText('전화가 걸려오기까지')).toBeVisible()
  expect(audit.getSessionCount()).toBe(0)
  await expect(page.getByRole('button', { name: '전화 받기', exact: true })).toBeVisible()
  expect(audit.getSessionCount()).toBe(1)
  expect(await page.evaluate(() => window.badaAudioAudit.contexts.length)).toBe(0)
  await page.getByRole('button', { name: '전화 받기', exact: true }).click()
  await page.getByRole('button', { name: '건너뛰기', exact: true }).click()
  await expect(page.getByRole('heading', { name: '상담 직원' })).toBeVisible()
  await page.getByRole('button', { name: '통화 종료', exact: true }).click()
  await expect(page).toHaveURL(/\/training\/1\/result/)
})

test('keeps the result screen available for retry when anxiety score saving fails', async ({
  page,
}) => {
  await prepareCall(page)
  let attempts = 0
  await page.route('**/api/v1/training-records/browser-session-1/anxiety-score', async (route) => {
    attempts += 1
    expect(route.request().postDataJSON()).toEqual({ score: 1 })
    await route.fulfill({ status: attempts === 1 ? 503 : 200, json: { data: null } })
  })
  await page.route('**/api/v1/training-records?*', (route) =>
    route.fulfill({ json: { data: { content: [], totalPages: 1 } } }),
  )
  await startCall(page)
  await expect(page.getByRole('heading', { name: '상담 직원' })).toBeVisible()
  await page.getByRole('button', { name: '통화 종료', exact: true }).click()
  await expect(page).toHaveURL(/\/training\/1\/result/)
  await page.getByRole('button', { name: '건너뛰기', exact: true }).click()
  await page.getByRole('button', { name: '훈련 마치기', exact: true }).click()
  await expect(page.getByRole('alert')).toContainText('저장하지 못했어요')
  await expect(page).toHaveURL(/\/training\/1\/result/)
  await page.getByRole('button', { name: '훈련 마치기', exact: true }).click()
  await expect(page).toHaveURL(/\/records/)
  expect(attempts).toBe(2)
})

test('receives a server schedule, accepts its existing session and cleans the call', async ({
  page,
}) => {
  const audit = await prepareCall(page)
  let ringingRequests = 0
  let accepts = 0
  const schedule = {
    scheduleId: 10,
    status: 'SCHEDULED',
    scheduledAt: new Date(Date.now() + 1000).toISOString(),
  }
  await page.route('**/api/v1/training-call-schedules', (route) => {
    expect(route.request().postDataJSON()).toEqual({
      scenarioId: 1,
      type: 'SCENARIO',
      aiPersonality: 'KIND',
      minDelayMinutes: 1,
      maxDelayMinutes: 1,
    })
    return route.fulfill({ json: { data: schedule } })
  })
  await page.route('**/api/v1/training-call-schedules/ringing', (route) => {
    ringingRequests += 1
    return route.fulfill({
      json: ringingRequests < 2 ? { status: 200 } : { data: { ...schedule, status: 'RINGING' } },
    })
  })
  await page.route('**/api/v1/training-call-schedules/10/accept', (route) => {
    accepts += 1
    return route.fulfill({
      json: {
        data: {
          scheduleId: 10,
          status: 'ACCEPTED',
          sessionId: 'accepted-session',
          wsUrl: 'ws://internal-host/ignored',
        },
      },
    })
  })
  await page.goto('/training/1/settings')
  await page.getByRole('button', { name: '다음으로', exact: true }).click()
  await page
    .getByText('최소', { exact: true })
    .locator('..')
    .getByRole('button', { name: '1분', exact: true })
    .click()
  await page
    .getByText('최대', { exact: true })
    .locator('..')
    .getByRole('button', { name: '1분', exact: true })
    .click()
  await page.getByRole('checkbox', { name: '페이지를 벗어나도 예약 유지' }).check()
  await expect(page.getByText(/예약 전화는 기본 난이도로/)).toBeVisible()
  await page.getByRole('button', { name: '설정 완료하기', exact: true }).click()
  await expect(page.getByText('전화가 걸려오기까지')).toBeVisible()
  expect(audit.getSessionCount()).toBe(0)
  await expect(page.getByRole('button', { name: '전화 받기', exact: true })).toBeVisible({
    timeout: 8000,
  })
  await page.getByRole('button', { name: '전화 받기', exact: true }).click()
  await page.getByRole('button', { name: '건너뛰기', exact: true }).click()
  await expect(page.getByRole('heading', { name: '상담 직원' })).toBeVisible()
  await expect.poll(() => audit.binaryFrames.length).toBeGreaterThan(0)
  expect(accepts).toBe(1)
  expect(audit.getSessionCount()).toBe(0)
  await page.getByRole('button', { name: '통화 종료', exact: true }).click()
  await expect(page).toHaveURL(/\/training\/1\/result/)
  expect(
    await page.evaluate(() =>
      window.badaAudioAudit.streams.every((stream) =>
        stream.getTracks().every((track) => track.readyState === 'ended'),
      ),
    ),
  ).toBe(true)
})

test('restores a ringing reservation from the catalog and retries cancellation without opening the microphone', async ({
  page,
}) => {
  await prepareCall(page)
  let cancellations = 0
  await page.route('**/api/v1/training-call-schedules/ringing', (route) =>
    route.fulfill({ json: { data: { scheduleId: 11, status: 'RINGING' } } }),
  )
  await page.route('**/api/v1/training-call-schedules/11', (route) => {
    cancellations += 1
    return route.fulfill({
      status: cancellations === 1 ? 503 : 200,
      json: { data: { scheduleId: 11, status: 'CANCELED' } },
    })
  })
  await page.goto('/training')
  await page.getByRole('button', { name: '예약 전화 확인', exact: true }).click()
  await page.getByRole('button', { name: '전화 거절', exact: true }).click()
  await expect(page.getByRole('alert')).toContainText('예약을 취소하지 못했어요')
  await page.getByRole('button', { name: '목록으로 돌아가기', exact: true }).click()
  await expect(page).toHaveURL(/\/training$/)
  expect(cancellations).toBe(2)
  expect(await page.evaluate(() => window.badaAudioAudit.streams.length)).toBe(0)
})

test('does not post an anxiety score for server NO_AUDIO termination', async ({ page }) => {
  const audit = await prepareCall(page)
  let scoreRequests = 0
  await page.route('**/api/v1/training-records/*/anxiety-score', (route) => {
    scoreRequests += 1
    return route.fulfill({ status: 403, json: {} })
  })
  await page.route('**/api/v1/training-records?*', (route) =>
    route.fulfill({ json: { data: { content: [], totalPages: 1 } } }),
  )
  await startCall(page)
  await expect(page.getByRole('heading', { name: '상담 직원' })).toBeVisible()
  audit.getSocket().send(JSON.stringify({ type: 'end', reason: 'NO_AUDIO' }))
  await expect(page.getByRole('button', { name: '기록 확인하기', exact: true })).toBeVisible()
  await expect(page.getByRole('button', { name: '불안 점수 1', exact: true })).toHaveCount(0)
  await page.getByRole('button', { name: '기록 확인하기', exact: true }).click()
  await expect(page).toHaveURL(/\/records$/)
  expect(scoreRequests).toBe(0)
})

test('uses server hint levels for a fixed recommendation/advice footer and hides no-hint levels', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  const audit = await prepareCall(page)
  await startCall(page)
  await expect(page.getByRole('heading', { name: '상담 직원' })).toBeVisible()
  await page.getByRole('button', { name: '스크립트 보기', exact: true }).click()
  audit
    .getSocket()
    .send(
      JSON.stringify({ type: 'script_hint', level: 1, text: '내일 오후 두 명 예약하고 싶어요.' }),
    )
  await expect(page.getByRole('status', { name: '추천 문장', exact: true })).toHaveText(
    '추천 : 내일 오후 두 명 예약하고 싶어요.',
  )
  for (let index = 0; index < 40; index += 1) {
    audit
      .getSocket()
      .send(
        JSON.stringify({
          type: 'transcript',
          role: index % 2 ? 'user' : 'ai',
          text: `예약 대화 ${index + 1}`,
        }),
      )
  }
  await expect(page.getByText('예약 대화 40', { exact: false })).toHaveCount(1)
  const hintBottom = await page
    .getByRole('status', { name: '추천 문장', exact: true })
    .evaluate((element) => element.getBoundingClientRect().bottom)
  const transcriptScroll = page.locator('aside .overflow-y-auto')
  await transcriptScroll.evaluate((element) => {
    element.scrollTop = element.scrollHeight
  })
  await expect(page.getByRole('status', { name: '추천 문장', exact: true })).toBeVisible()
  expect(
    await page
      .getByRole('status', { name: '추천 문장', exact: true })
      .evaluate((element) => element.getBoundingClientRect().bottom),
  ).toBe(hintBottom)
  await page.screenshot({
    path: test.info().outputPath('script-recommendation.png'),
    fullPage: true,
  })
  audit
    .getSocket()
    .send(JSON.stringify({ type: 'script_hint', level: 2, text: '원하는 예약 시간을 말해보세요.' }))
  await expect(page.getByRole('status', { name: '대답 조언', exact: true })).toHaveText(
    '원하는 예약 시간을 말해보세요.',
  )
  await expect(page.getByRole('status', { name: '추천 문장', exact: true })).toHaveCount(0)
  await page.screenshot({ path: test.info().outputPath('script-advice.png'), fullPage: true })
  await page.getByRole('button', { name: '스크립트 보기', exact: true }).click()
  await page.getByRole('button', { name: '스크립트 보기', exact: true }).click()
  await expect(page.getByRole('status', { name: '대답 조언', exact: true })).toBeVisible()
  audit
    .getSocket()
    .send(
      JSON.stringify({ type: 'script_hint', level: 3, text: '이 문장이 있어도 숨겨야 합니다.' }),
    )
  await expect(page.getByRole('status', { name: '대답 조언', exact: true })).toHaveCount(0)
  await expect(page.getByRole('status', { name: '추천 문장', exact: true })).toHaveCount(0)
  audit.getSocket().send(JSON.stringify({ type: 'script_hint', level: 1, text: '  ' }))
  await expect(page.getByRole('status', { name: '추천 문장', exact: true })).toHaveCount(0)
  await page.getByRole('button', { name: '통화 종료', exact: true }).click()
  await expect(page).toHaveURL(/\/training\/1\/result/)
  expect(audit.errors).toEqual([])
})
