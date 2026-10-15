import { useEffect, useRef, useState } from 'react'
import { acceptLegalConsents, getLegalConsentStatus } from '@entities/legal-consent'
import { getApiErrorMessage } from '@shared/api'
import { useQueryClient } from '@tanstack/react-query'

/** 워밍업 요청 전에 동의를 확인하고 명시적 동의 후에만 대기 중인 요청을 계속합니다. */
export const useWarmupConsent = () => {
  const queryClient = useQueryClient()
  const mounted = useRef(true)
  const resolveConsent = useRef<((accepted: boolean) => void) | null>(null)
  const isSavingRef = useRef(false)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState('')
  useEffect(() => {
    mounted.current = true
    return () => {
      mounted.current = false
      resolveConsent.current?.(false)
      resolveConsent.current = null
    }
  }, [])

  /** 서버가 동의를 거절한 경우에는 저장된 동의 값과 관계없이 다시 동의를 받습니다. */
  const ensureConsent = async (forcePrompt = false) => {
    const status = await getLegalConsentStatus()
    if (!mounted.current) return false
    if (status.sensitiveInformationAgreed && !forcePrompt) return true
    setError('')
    return new Promise<boolean>((resolve) => {
      resolveConsent.current = resolve
      setIsDialogOpen(true)
    })
  }

  /** 다른 동의는 최신 서버 값을 유지하고 민감정보 처리 동의만 저장합니다. */
  const handleAccept = async () => {
    if (isSavingRef.current || !resolveConsent.current) return
    isSavingRef.current = true
    setIsSaving(true)
    setError('')
    try {
      const current = await getLegalConsentStatus()
      if (!mounted.current) return
      const status = await acceptLegalConsents({
        termsOfServiceAgreed: current.termsOfServiceAgreed,
        privacyPolicyAcknowledged: current.privacyPolicyAcknowledged,
        profileImageAgreed: current.profileImageAgreed,
        sensitiveInformationAgreed: true,
      })
      if (!status.sensitiveInformationAgreed) throw new Error('Sensitive consent was not saved')
      queryClient.setQueryData(['legal-consent', 'status'], status)
      if (!mounted.current) return
      setIsDialogOpen(false)
      resolveConsent.current?.(true)
      resolveConsent.current = null
    } catch (error) {
      if (mounted.current)
        setError(getApiErrorMessage(error, '동의를 저장하지 못했어요. 다시 시도해 주세요.'))
    } finally {
      isSavingRef.current = false
      if (mounted.current) setIsSaving(false)
    }
  }

  /** 동의를 취소하면 시나리오와 세션을 생성하지 않습니다. */
  const handleDecline = () => {
    if (isSavingRef.current) return
    setIsDialogOpen(false)
    resolveConsent.current?.(false)
    resolveConsent.current = null
  }
  return { ensureConsent, isDialogOpen, isSaving, error, handleAccept, handleDecline }
}
