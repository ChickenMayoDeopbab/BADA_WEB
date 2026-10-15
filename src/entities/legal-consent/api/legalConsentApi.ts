import type { AcceptLegalConsentRequest, LegalConsentStatus } from '../model/types'
import { httpClient } from '@shared/api'
import type { ApiResponse } from '@shared/types'

const LEGAL_CONSENT_PATH = '/api/v1/legal-consents'
type LegalConsentResponse = LegalConsentStatus | ApiResponse<LegalConsentStatus>

/** 앱과 같이 직접 응답과 공통 래퍼 응답을 모두 처리합니다. */
const unwrapLegalConsentStatus = (data: LegalConsentResponse) =>
  'legalActionRequired' in data ? data : data.data

/** 프로필 이미지 처리 동의를 철회하고 갱신된 상태를 받습니다. */
export const withdrawProfileImageConsent = async () => {
  const { data } = await httpClient.delete<LegalConsentResponse>(
    `${LEGAL_CONSENT_PATH}/profile-image`,
  )
  return unwrapLegalConsentStatus(data)
}

/** 민감정보 처리 동의를 철회합니다. */
export const withdrawSensitiveInformationConsent = async () => {
  await httpClient.delete(`${LEGAL_CONSENT_PATH}/sensitive-information`)
}

/** 로그인한 사용자의 약관·민감정보 동의 상태를 조회합니다. */
export const getLegalConsentStatus = async () => {
  const { data } = await httpClient.get<LegalConsentResponse>(`${LEGAL_CONSENT_PATH}/status`)

  return unwrapLegalConsentStatus(data)
}

/** 약관·민감정보 동의 내용을 저장하고 갱신된 동의 상태를 받습니다. */
export const acceptLegalConsents = async (request: AcceptLegalConsentRequest) => {
  const { data } = await httpClient.post<LegalConsentResponse>(
    `${LEGAL_CONSENT_PATH}/accept`,
    request,
  )

  return unwrapLegalConsentStatus(data)
}
