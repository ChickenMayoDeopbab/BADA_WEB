import type { AcceptLegalConsentRequest, LegalConsentStatus } from '../model/types'
import { httpClient } from '@shared/api'
import type { ApiResponse } from '@shared/types'

const LEGAL_CONSENT_PATH = '/api/v1/legal-consents'

/** 민감정보 처리 동의를 철회합니다. */
export const withdrawSensitiveInformationConsent = async () => {
  await httpClient.delete(`${LEGAL_CONSENT_PATH}/sensitive-information`)
}

/** 로그인한 사용자의 약관·민감정보 동의 상태를 조회합니다. */
export const getLegalConsentStatus = async () => {
  const { data } = await httpClient.get<ApiResponse<LegalConsentStatus>>(
    `${LEGAL_CONSENT_PATH}/status`,
  )

  return data.data
}

/** 약관·민감정보 동의 내용을 저장하고 갱신된 동의 상태를 받습니다. */
export const acceptLegalConsents = async (request: AcceptLegalConsentRequest) => {
  const { data } = await httpClient.post<ApiResponse<LegalConsentStatus>>(
    `${LEGAL_CONSENT_PATH}/accept`,
    request,
  )

  return data.data
}
