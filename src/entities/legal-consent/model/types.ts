export interface LegalConsentStatus {
  termsOfServiceAgreed: boolean
  privacyPolicyAcknowledged: boolean
  sensitiveInformationAgreed: boolean
  profileImageAgreed: boolean
  /** 필수 약관 동의 화면을 보여줘야 하는지 여부입니다. */
  legalActionRequired: boolean
}

export interface AcceptLegalConsentRequest {
  termsOfServiceAgreed: boolean
  privacyPolicyAcknowledged: boolean
  sensitiveInformationAgreed: boolean
  profileImageAgreed: boolean
}
