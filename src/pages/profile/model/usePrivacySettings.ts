import {
  acceptLegalConsents,
  getLegalConsentStatus,
  withdrawProfileImageConsent,
  withdrawSensitiveInformationConsent,
} from '@entities/legal-consent'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

export type OptionalConsent = 'profileImage' | 'sensitive'
const consentKey = ['legal-consent', 'status'] as const

/** 앱과 동일한 선택 동의 등록·철회를 연결하고 서로의 동의 상태를 보존합니다. */
export const usePrivacySettings = () => {
  const queryClient = useQueryClient()
  const status = useQuery({ queryKey: consentKey, queryFn: getLegalConsentStatus })
  const update = useMutation({
    meta: { successMessage: '동의 설정을 변경했어요.' },
    mutationFn: async ({ type, agreed }: { type: OptionalConsent; agreed: boolean }) => {
      if (!agreed) {
        if (type === 'profileImage') return withdrawProfileImageConsent()
        await withdrawSensitiveInformationConsent()
        return getLegalConsentStatus()
      }
      const current = await getLegalConsentStatus()
      return acceptLegalConsents({
        termsOfServiceAgreed: current.termsOfServiceAgreed,
        privacyPolicyAcknowledged: current.privacyPolicyAcknowledged,
        sensitiveInformationAgreed:
          type === 'sensitive' ? true : current.sensitiveInformationAgreed,
        profileImageAgreed: type === 'profileImage' ? true : current.profileImageAgreed,
      })
    },
    onSuccess: async (nextStatus) => {
      queryClient.setQueryData(consentKey, nextStatus)
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['legal-consent'] }),
        queryClient.invalidateQueries({ queryKey: ['profile'] }),
        queryClient.invalidateQueries({ queryKey: ['user'] }),
      ])
    },
  })
  return { status, update }
}
