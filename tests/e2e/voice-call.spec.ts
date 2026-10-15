import { expect, test, type Page, type WebSocketRoute } from '@playwright/test'

test.use({
  launchOptions: { args: ['--use-fake-device-for-media-stream', '--use-fake-ui-for-media-stream'] },
})

declare global {
  interface Window {
    badaAudioAudit: { contexts: AudioContext[]; streams: MediaStream[] }
    badaGrantMicrophone: () => Promise<void>
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
  await page.route('**/api/v1/user/mypage', (route) => route.fulfill({ json: { data: {} } }))
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
    audit.getSocket().send(
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

test('does not reconnect a disposed session after browser back and forward', async ({ page }) => {
  const audit = await prepareCall(page)
  await startCall(page)
  await expect.poll(() => audit.binaryFrames.length).toBeGreaterThan(0)
  await page.goBack()
  await expect(page).toHaveURL(/\/training\/1\/settings$/)
  await page.goForward()
  await expect(page.getByRole('alert')).toContainText('종료된 통화')
  await expect(page.getByRole('button', { name: '전화 받기', exact: true })).toHaveCount(0)
  await page.getByRole('button', { name: '새 훈련 시작', exact: true }).click()
  await startCall(page, false)
  await expect(page.getByRole('heading', { name: '상담 직원' })).toBeVisible()
  expect(audit.getSessionCount()).toBe(2)
  expect(audit.messages.filter((message) => message.type === 'auth')).toHaveLength(2)
})

test('does not reuse a live session after reloading the call route', async ({ page }) => {
  const audit = await prepareCall(page)
  await startCall(page)
  await expect.poll(() => audit.binaryFrames.length).toBeGreaterThan(0)
  await page.reload()
  await expect(page.getByRole('alert')).toContainText('종료된 통화')
  expect(await page.evaluate(() => window.badaAudioAudit.streams.length)).toBe(0)
  expect(audit.messages.filter((message) => message.type === 'auth')).toHaveLength(1)
})

test('keeps a due local reservation session when its incoming route is reloaded', async ({
  page,
}) => {
  const audit = await prepareCall(page)
  await page.addInitScript(() => {
    if (history.state?.usr) return
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
  await expect(page.getByRole('button', { name: '전화 받기', exact: true })).toBeVisible()
  expect(audit.getSessionCount()).toBe(1)
  await page.reload()
  await expect(page.getByRole('button', { name: '전화 받기', exact: true })).toBeVisible()
  await page.getByRole('button', { name: '전화 받기', exact: true }).click()
  await page.getByRole('button', { name: '건너뛰기', exact: true }).click()
  await expect(page.getByRole('heading', { name: '상담 직원' })).toBeVisible()
  expect(audit.getSessionCount()).toBe(1)
})

test('preserves an active call when history state is replaced for the same call', async ({
  page,
}) => {
  const audit = await prepareCall(page)
  await startCall(page)
  await expect.poll(() => audit.binaryFrames.length).toBeGreaterThan(0)
  await page.getByRole('button', { name: '스크립트 보기', exact: true }).click()
  audit
    .getSocket()
    .send(JSON.stringify({ type: 'transcript', role: 'user', text: '연결 유지 확인' }))
  await expect(page.getByText('연결 유지 확인', { exact: false })).toBeVisible()
  const frameCount = audit.binaryFrames.length
  await page.evaluate(() => {
    history.replaceState({ ...history.state, key: 'updated-call-state' }, '')
    dispatchEvent(new PopStateEvent('popstate', { state: history.state }))
  })
  await expect(page.getByRole('heading', { name: '상담 직원' })).toBeVisible()
  await expect(page.getByText('연결 유지 확인', { exact: false })).toBeVisible()
  await expect.poll(() => audit.binaryFrames.length).toBeGreaterThan(frameCount)
  expect(audit.getClosed()).toBe(0)
  expect(await page.evaluate(() => window.badaAudioAudit.contexts.length)).toBe(1)
  await page.getByRole('button', { name: '통화 종료', exact: true }).click()
  await expect(page).toHaveURL(/\/training\/1\/result$/)
})

test('does not redirect from the catalog when a session request from abandoned settings finishes', async ({
  page,
}) => {
  const audit = await prepareCall(page)
  let releaseResponse!: () => void
  const responseGate = new Promise<void>((resolve) => {
    releaseResponse = resolve
  })
  let hasRequested = false
  await page.route('**/api/v1/session', async (route) => {
    hasRequested = true
    await responseGate
    await route.fulfill({ json: { data: { sessionId: 'late-session', wsUrl: 'ws://unused' } } })
  })
  await page.goto('/training/1/settings')
  await page.getByRole('button', { name: '다음으로', exact: true }).click()
  await page.getByRole('button', { name: '설정 완료하기', exact: true }).click()
  await expect.poll(() => hasRequested).toBe(true)
  await page.getByRole('link', { name: '시나리오 훈련', exact: true }).click()
  await expect(page).toHaveURL(/\/training$/)
  const response = page.waitForResponse('**/api/v1/session')
  releaseResponse()
  await response
  await page.waitForTimeout(250) // 완료 콜백이 떠난 화면으로 이동시키지 않는지 확인합니다.
  await expect(page).toHaveURL(/\/training$/)
  expect(audit.messages).toEqual([])
})

test('rejects call state for a different scenario without connecting or creating a session', async ({
  page,
}) => {
  const audit = await prepareCall(page)
  await page.addInitScript(() => {
    history.replaceState(
      {
        ...history.state,
        usr: {
          scenario: { scenarioId: 2, title: '다른 시나리오', category: 'daily' },
          session: { sessionId: 'wrong-scenario-session', wsUrl: 'ws://unused' },
        },
      },
      '',
    )
  })
  await page.goto('/training/1/call')
  await expect(page.getByRole('alert')).toContainText('일치하지 않아요')
  await page.getByRole('button', { name: '새 훈련 시작', exact: true }).click()
  await expect(page).toHaveURL(/\/training\/1\/settings$/)
  expect(audit.messages).toEqual([])
  expect(audit.getSessionCount()).toBe(0)
})

test('keeps the absolute local reservation deadline after a reload while waiting', async ({
  page,
}) => {
  const audit = await prepareCall(page)
  await page.addInitScript(() => {
    if (history.state?.usr) return
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
          callDelaySeconds: 60,
          callScheduledAt: Date.now() + 2000,
        },
      },
      '',
    )
  })
  await page.goto('/training/1/call')
  await expect(page.getByText('전화가 걸려오기까지')).toBeVisible()
  await page.reload()
  await expect(page.getByRole('button', { name: '전화 받기', exact: true })).toBeVisible({
    timeout: 3500,
  })
  expect(audit.getSessionCount()).toBe(1)
  expect(await page.evaluate(() => window.badaAudioAudit.streams.length)).toBe(0)
})

test('returns to training when opening a result URL without a completed session', async ({
  page,
}) => {
  const audit = await prepareCall(page)
  await page.goto('/training/1/result')
  await expect(page).toHaveURL(/\/training$/)
  await expect(page.getByRole('heading', { name: '시나리오 훈련', exact: true })).toBeVisible()
  expect(audit.messages).toEqual([])
})

test('shows one changing next-sentence hint from the voice stream beside the latest conversation', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  const audit = await prepareCall(page)
  await startCall(page)
  await expect(page.getByRole('heading', { name: '상담 직원', exact: true })).toBeVisible()
  await page.getByRole('button', { name: '스크립트 보기', exact: true }).click()
  const hint = page.getByRole('status', { name: '추천 문장', exact: true })
  await expect(hint).toHaveCount(0)
  const socket = audit.getSocket()
  socket.send(
    JSON.stringify({
      type: 'transcript',
      role: 'user',
      text: '안녕하세요, 식사 예약하려고 전화드렸어요.',
    }),
  )
  sendAiTurn(socket, 1)
  socket.send(
    JSON.stringify({
      type: 'script_hint',
      level: 1,
      text: '내일 저녁 7시에 두 명 예약하고 싶어요.',
    }),
  )
  await expect(hint).toHaveCount(1)
  await expect(hint).toHaveText('추천 : 내일 저녁 7시에 두 명 예약하고 싶어요.')
  await page.screenshot({ path: test.info().outputPath('next-sentence-hint.png'), fullPage: true })
  await expect
    .poll(() =>
      audit.messages.some((frame) => frame.type === 'playback_done' && frame.turn_id === 1),
    )
    .toBe(true)
  await expect(page.getByRole('status').filter({ hasText: '편하게 말씀해 주세요.' })).toBeVisible()
  socket.send('{invalid optional metadata')
  socket.send(JSON.stringify({ type: 'script_hint', level: 'invalid', text: '무시하는 프레임' }))
  for (let index = 0; index < 25; index += 1) {
    socket.send(
      JSON.stringify({ type: 'transcript', role: 'user', text: `대화 내용 ${index + 1}` }),
    )
  }
  socket.send(
    JSON.stringify({ type: 'transcript', role: 'ai', text: '예약자 성함을 알려주시겠어요?' }),
  )
  socket.send(
    JSON.stringify({ type: 'script_hint', level: 1, text: '김바다 이름으로 예약해 주세요.' }),
  )
  await expect(hint).toHaveCount(1)
  await expect(hint).toHaveText('추천 : 김바다 이름으로 예약해 주세요.')
  await expect(page.getByText('예약자 성함을 알려주시겠어요?', { exact: false })).toBeInViewport()
  await expect(page.getByRole('heading', { name: '상담 직원', exact: true })).toBeVisible()
  await page.getByRole('button', { name: '스크립트 가리기', exact: true }).click()
  await expect(hint).toHaveCount(0)
  await page.getByRole('button', { name: '스크립트 보기', exact: true }).click()
  await expect(hint).toHaveText('추천 : 김바다 이름으로 예약해 주세요.')
  expect(audit.errors).toEqual([])
  expect(audit.getBinaryWhileMuted()).toBe(0)
  expect(audit.messages.filter((frame) => frame.type === 'mute' && frame.muted)).toHaveLength(1)
  await page.getByRole('button', { name: '통화 종료', exact: true }).click()
  await expect(page).toHaveURL(/\/training\/1\/result$/)
})

test('renders only spoken WebSocket transcripts and never loads scenario example dialogue during a call', async ({
  page,
}) => {
  const audit = await prepareCall(page)
  let exampleRequests = 0
  await page.route('**/api/v1/scenario/1/example', async (route) => {
    exampleRequests += 1
    await route.fulfill({
      json: {
        dialogue: [
          { speaker: 'ai', text: '표시되면 안 되는 미리 작성된 대화' },
          { speaker: 'user', text: '실제로 말하지 않은 예시 문장' },
        ],
      },
    })
  })
  await startCall(page)
  await expect(page.getByRole('heading', { name: '상담 직원', exact: true })).toBeVisible()
  await page.getByRole('button', { name: '스크립트 보기', exact: true }).click()
  await expect(
    page.getByRole('heading', { name: '실시간 대화 스크립트', exact: true }),
  ).toBeVisible()
  await expect(page.locator('aside li')).toHaveCount(0)
  await expect(page.getByText('표시되면 안 되는 미리 작성된 대화', { exact: false })).toHaveCount(0)
  await expect.poll(() => audit.binaryFrames.length).toBeGreaterThan(0)
  const spokenText = '지금은 내일이 아니라 금요일 오후 세 시에 세 명 예약하고 싶어요.'
  audit.getSocket().send(JSON.stringify({ type: 'transcript', role: 'user', text: spokenText }))
  await expect(page.locator('aside li')).toHaveText([`나 : ${spokenText}`])
  const response = '금요일 오후 세 시, 세 분으로 예약 도와드리겠습니다.'
  audit.getSocket().send(JSON.stringify({ type: 'transcript', role: 'ai', text: response }))
  await expect(page.locator('aside li')).toHaveText([`나 : ${spokenText}`, `상대방 : ${response}`])
  expect(exampleRequests).toBe(0)
  expect(audit.errors).toEqual([])
  await page.getByRole('button', { name: '통화 종료', exact: true }).click()
  await expect(page).toHaveURL(/\/training\/1\/result$/)
})

test('can grant microphone permission after thirty seconds and still start the voice call', async ({
  page,
}) => {
  const audit = await prepareCall(page)
  await page.addInitScript(() => {
    const getUserMedia = navigator.mediaDevices.getUserMedia.bind(navigator.mediaDevices)
    navigator.mediaDevices.getUserMedia = (constraints) =>
      new Promise<MediaStream>((resolve, reject) => {
        window.badaGrantMicrophone = async () => {
          try {
            resolve(await getUserMedia(constraints))
          } catch (error) {
            reject(error)
          }
        }
      })
  })
  await page.clock.install()
  await startCall(page)
  await expect(
    page.getByRole('status').filter({ hasText: '브라우저에서 마이크 사용을 허용해 주세요.' }),
  ).toBeVisible()
  await page.clock.fastForward(31000)
  await expect(page.getByRole('alert')).toHaveCount(0)
  expect(audit.messages).toEqual([])
  await page.evaluate(() => window.badaGrantMicrophone())
  await expect(page.getByRole('heading', { name: '상담 직원', exact: true })).toBeVisible()
  await expect.poll(() => audit.binaryFrames.length).toBeGreaterThan(0)
  await page.getByRole('button', { name: '통화 종료', exact: true }).click()
  await expect(page.getByRole('status')).toHaveText('훈련 결과 대기 중')
  await page.clock.fastForward(2000)
  await expect(page).toHaveURL(/\/training\/1\/result$/)
  expect(audit.errors).toEqual([])
})

test('waits for server end persistence without sending audio or failing after fifteen seconds', async ({
  page,
}) => {
  const audit = await prepareCall(page)
  let socket!: WebSocketRoute
  let hasReceivedEnd = false
  await page.routeWebSocket('**/ws/voice/*', (route) => {
    socket = route
    route.onMessage((message) => {
      if (typeof message !== 'string') return
      const frame = JSON.parse(message)
      if (frame.type === 'auth')
        route.send(JSON.stringify({ type: 'scenario_info', aiRole: '저장 검증 직원' }))
      if (frame.type === 'end') hasReceivedEnd = true
    })
  })
  await page.clock.install()
  await startCall(page)
  await expect(page.getByRole('heading', { name: '저장 검증 직원', exact: true })).toBeVisible()
  await page.getByRole('button', { name: '스크립트 보기', exact: true }).click()
  await expect(page.getByRole('heading', { name: '실시간 대화 스크립트' })).toBeVisible()
  await page.clock.fastForward(42000)
  await page.getByRole('button', { name: '통화 종료', exact: true }).click()
  await expect.poll(() => hasReceivedEnd).toBe(true)
  const timer = page.getByText('00:42', { exact: true })
  await expect(timer).toBeVisible()
  await expect(timer).toHaveCSS('animation-name', 'pulse')
  await expect(page.getByRole('main')).toHaveCSS('background-image', 'none')
  await expect(page.getByRole('main')).toHaveCSS('background-color', 'rgb(254, 254, 254)')
  await expect(page.getByRole('button', { name: '통화 종료', exact: true })).toBeDisabled()
  await expect(page.getByRole('button', { name: '스크립트 보기', exact: true })).toHaveCount(0)
  await expect(page.getByRole('heading', { name: '실시간 대화 스크립트' })).toHaveCount(0)
  await expect(page.locator('aside')).toBeHidden()
  await expect(page.getByText('훈련을 종료했습니다.', { exact: true })).toHaveCount(0)
  await page.screenshot({ path: 'test-results/call-end-local.png' })
  await page.clock.fastForward(70000)
  await expect(page.getByRole('alert')).toHaveCount(0)
  await expect(page.getByRole('status')).toHaveText('훈련 결과 대기 중')
  await expect(timer).toHaveText('00:42')
  await expect(page).toHaveURL(/\/training\/1\/call$/)
  expect(
    await page.evaluate(
      () =>
        window.badaAudioAudit.contexts.every((context) => context.state === 'closed') &&
        window.badaAudioAudit.streams.every((stream) =>
          stream.getTracks().every((track) => track.readyState === 'ended'),
        ),
    ),
  ).toBe(true)
  socket.send(JSON.stringify({ type: 'end', reason: 'USER_END' }))
  await expect(page.getByRole('status')).toHaveText('훈련 결과 대기 중')
  await page.clock.fastForward(2000)
  await expect(page).toHaveURL(/\/training\/1\/result$/)
  expect(audit.errors).toEqual([])
})

test('shows a plain waiting screen and frozen pulsing timer when the other party hangs up', async ({
  page,
}) => {
  const audit = await prepareCall(page)
  await page.clock.install()
  await startCall(page)
  await expect(page.getByRole('heading', { name: '상담 직원', exact: true })).toBeVisible()
  await page.getByRole('button', { name: '스크립트 보기', exact: true }).click()
  await expect(page.getByRole('heading', { name: '실시간 대화 스크립트' })).toBeVisible()
  await page.clock.fastForward(42000)
  audit.getSocket().send(JSON.stringify({ type: 'end', reason: 'SCENARIO_DONE' }))
  const timer = page.getByText('00:42', { exact: true })
  await expect(page.getByRole('status')).toHaveText('훈련 결과 대기 중')
  await expect(timer).toHaveCSS('animation-name', 'pulse')
  await expect(page.getByRole('main')).toHaveCSS('background-image', 'none')
  await expect(page.getByRole('main')).toHaveCSS('background-color', 'rgb(254, 254, 254)')
  const hangupButton = page.getByRole('button', { name: '통화 종료', exact: true })
  await expect(hangupButton).toBeDisabled()
  await expect(hangupButton).toHaveCSS('background-color', 'rgb(255, 153, 153)')
  await expect(page.getByRole('heading', { name: '실시간 대화 스크립트' })).toHaveCount(0)
  await expect(page.locator('aside')).toBeHidden()
  await expect(page.getByRole('button', { name: '음소거', exact: true })).toHaveCount(0)
  await expect(page.getByText('훈련을 종료했습니다.', { exact: true })).toHaveCount(0)
  const mainBox = await page.getByRole('main').boundingBox()
  const avatarBox = await page.getByRole('img', { name: 'AI 통화 상대' }).boundingBox()
  expect(
    Math.abs(avatarBox!.x + avatarBox!.width / 2 - (mainBox!.x + mainBox!.width / 2)),
  ).toBeLessThan(1)
  await page.screenshot({ path: 'test-results/call-end-remote.png' })
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await expect(timer).toHaveCSS('animation-name', 'none')
  await page.clock.fastForward(1000)
  await expect(timer).toHaveText('00:42')
  await page.clock.fastForward(1000)
  await expect(page).toHaveURL(/\/training\/1\/result$/)
  expect(audit.errors).toEqual([])
})

test('records mixed call audio to a real file and flushes another recording when the call ends', async ({
  page,
}, testInfo) => {
  const audit = await prepareCall(page)
  await startCall(page)
  await expect(page.getByRole('heading', { name: '상담 직원' })).toBeVisible()
  await page.getByRole('button', { name: '녹음', exact: true }).click()
  await expect(page.getByRole('button', { name: '녹음 저장', exact: true })).toBeVisible()
  sendAiTurn(audit.getSocket(), 9)
  await expect
    .poll(() =>
      audit.messages.some((message) => message.type === 'playback_done' && message.turn_id === 9),
    )
    .toBe(true)
  const saved = page.waitForEvent('download')
  await page.getByRole('button', { name: '녹음 저장', exact: true }).click()
  const recording = await saved
  expect(recording.suggestedFilename()).toMatch(/^bada-call-browser-session-1\.(webm|m4a)$/)
  await recording.saveAs(testInfo.outputPath(recording.suggestedFilename()))
  const { stat } = await import('node:fs/promises')
  expect((await stat(await recording.path())).size).toBeGreaterThan(1000)
  const beforeSecondRecording = audit.binaryFrames.length
  await page.getByRole('button', { name: '녹음', exact: true }).click()
  await expect.poll(() => audit.binaryFrames.length).toBeGreaterThan(beforeSecondRecording + 60)
  const finalSave = page.waitForEvent('download')
  await page.getByRole('button', { name: '통화 종료', exact: true }).click()
  await finalSave
  await expect
    .poll(() =>
      page.evaluate(() =>
        window.badaAudioAudit.contexts.every((context) => context.state === 'closed'),
      ),
    )
    .toBe(true)
  expect(audit.errors).toEqual([])
})

test('finishes a fixed YouTube meditation screen into a call and restores page scrolling', async ({
  page,
}) => {
  const audit = await prepareCall(page)
  await page.route('https://www.youtube-nocookie.com/embed/**', (route) =>
    route.fulfill({
      contentType: 'text/html',
      body: '<html><body style="margin:0;background:black"></body></html>',
    }),
  )
  await page.goto('/training/1/settings')
  await page.getByRole('button', { name: '다음으로', exact: true }).click()
  await page.getByRole('button', { name: '설정 완료하기', exact: true }).click()
  await page.getByRole('button', { name: '전화 받기', exact: true }).click()
  await page.getByRole('button', { name: '명상하기', exact: true }).click()
  await expect(page.getByTitle('통화 전 명상 영상')).toBeVisible()
  await expect(page.locator('html')).toHaveCSS('overflow', 'hidden')
  await expect(page.locator('video')).toHaveCount(0)
  await page.setViewportSize({ width: 390, height: 844 })
  const bounds = await page.getByTitle('통화 전 명상 영상').boundingBox()
  expect(bounds?.height).toBe(844)
  await page.getByRole('button', { name: '명상 끝내고 전화하기' }).click()
  await expect(page.getByRole('heading', { name: '상담 직원', exact: true })).toBeVisible()
  await expect(page.getByTitle('통화 전 명상 영상')).toHaveCount(0)
  await expect(page.locator('html')).not.toHaveCSS('overflow', 'hidden')
  await page.getByRole('button', { name: '통화 종료', exact: true }).click()
  expect(audit.errors).toEqual([])
})
