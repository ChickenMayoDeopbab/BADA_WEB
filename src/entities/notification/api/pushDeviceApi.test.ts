import { afterEach, expect, it, vi } from 'vitest'
import { registerPushDevice, unregisterPushDevice } from './pushDeviceApi'

const { put, remove } = vi.hoisted(() => ({ put: vi.fn(), remove: vi.fn() }))
vi.mock('@shared/api', () => ({ httpClient: { put, delete: remove } }))
afterEach(() => vi.clearAllMocks())

it('기기 토큰을 갱신하고 설치 식별자를 URL 인코딩해 해당 기기만 해제한다', async () => {
  const device = { installationId: 'install/device', token: 'fcm-token', platform: 'IOS' as const }
  await registerPushDevice(device)
  expect(put).toHaveBeenCalledWith('/api/v1/notifications/devices', device)
  await unregisterPushDevice(device.installationId)
  expect(remove).toHaveBeenCalledWith('/api/v1/notifications/devices/install%2Fdevice')
})
