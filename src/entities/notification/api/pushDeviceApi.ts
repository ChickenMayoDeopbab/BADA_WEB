import { httpClient } from '@shared/api'

// 서버가 현재 허용하는 네이티브 기기 플랫폼입니다. 웹을 다른 플랫폼으로 위장하지 않습니다.
export interface RegisterPushDeviceRequest {
  installationId: string
  token: string
  platform: 'ANDROID' | 'IOS'
}

/** 서버가 지원하는 기기의 설치 식별자와 푸시 토큰을 등록·갱신합니다. */
export const registerPushDevice = async (request: RegisterPushDeviceRequest) => {
  await httpClient.put('/api/v1/notifications/devices', request)
}

/** 현재 설치 기기의 푸시 등록만 해제합니다. */
export const unregisterPushDevice = async (installationId: string) => {
  await httpClient.delete(`/api/v1/notifications/devices/${encodeURIComponent(installationId)}`)
}
