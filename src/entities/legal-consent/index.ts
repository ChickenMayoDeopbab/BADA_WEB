export {
  acceptLegalConsents,
  getLegalConsentStatus,
  withdrawSensitiveInformationConsent,
  withdrawProfileImageConsent,
} from './api/legalConsentApi'
export type { AcceptLegalConsentRequest, LegalConsentStatus } from './model/types'

export {
  TERMS_OF_SERVICE_SECTIONS,
  SENSITIVE_INFORMATION_SECTIONS,
  PROFILE_IMAGE_SECTIONS,
} from './model/legalDocuments'
export type { LegalDocumentSection } from './model/legalDocuments'
export { PRIVACY_POLICY_TEXT } from './model/privacyPolicy'
