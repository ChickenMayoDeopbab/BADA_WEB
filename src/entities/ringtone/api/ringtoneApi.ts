import type { Ringtone, RingtoneSetting } from '../model/types'
import { httpClient } from '@shared/api'
import type { ApiResponse } from '@shared/types'

const RINGTONES_PATH = '/api/v1/ringtones'

/** 사용자가 추가한 벨소리 목록을 조회합니다. */
export const getRingtones = async (signal?: AbortSignal) => {
  const { data } = await httpClient.get<ApiResponse<Ringtone[]>>(RINGTONES_PATH, { signal })
  return data.data
}

/** 미리듣기에 사용할 벨소리의 최신 주소를 조회합니다. */
export const getRingtone = async (fileId: number) => {
  const { data } = await httpClient.get<ApiResponse<Ringtone>>(`${RINGTONES_PATH}/${fileId}`)
  return data.data
}

/** 사용자가 선택한 음성 파일을 벨소리로 추가합니다. */
export const uploadRingtone = async (file: File) => {
  const formData = new FormData()
  formData.append('file', file)
  const { data } = await httpClient.post<ApiResponse<Ringtone>>(RINGTONES_PATH, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    timeout: 60_000,
  })
  return data.data
}

/** 사용자가 추가한 벨소리를 삭제합니다. */
export const deleteRingtone = async (fileId: number) => {
  await httpClient.delete(`${RINGTONES_PATH}/${fileId}`)
}

/** 통화 수신에 사용할 현재 벨소리 설정을 조회합니다. */
export const getRingtoneSetting = async () => {
  const { data } = await httpClient.get<ApiResponse<RingtoneSetting>>(`${RINGTONES_PATH}/settings`)
  return data.data
}

/** 선택한 벨소리를 저장하며 null은 기본 벨소리를 의미합니다. */
export const updateRingtoneSetting = async (fileId: number | null) => {
  const { data } = await httpClient.put<ApiResponse<RingtoneSetting>>(
    `${RINGTONES_PATH}/settings`,
    { fileId },
  )
  return data.data
}
