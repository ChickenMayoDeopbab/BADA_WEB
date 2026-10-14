import { acceptLegalConsents, getLegalConsentStatus } from '@entities/legal-consent'
import { getApiErrorMessage } from '@shared/api'
import { useQueryClient } from '@tanstack/react-query'
import { useEffect, useRef, useState } from 'react'

/** 사진 저장 전에 현재 동의를 확인하고 명시적으로 동의한 경우에만 업로드를 이어갑니다. */
export const useProfileImageConsent = () => {
  const queryClient = useQueryClient()
  const resolveConsent = useRef<((agreed: boolean) => void) | null>(null)
  const mounted = useRef(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isChecking, setIsChecking] = useState(false)
  const [isAccepting, setIsAccepting] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    mounted.current = true
    return () => {
      mounted.current = false
      resolveConsent.current?.(false)
      resolveConsent.current = null
    }
  }, [])

  /** 저장 시점의 서버 동의를 확인하고 동의가 없으면 안내 대화상자를 엽니다. */
  const ensureConsent = async () => {
    if (isChecking) return false
    setIsChecking(true)
    try {
      const status = await getLegalConsentStatus()
      if (!mounted.current) return false
      if (status.profileImageAgreed) return true
      setError('')
      setIsDialogOpen(true)
      return await new Promise<boolean>((resolve) => {
        resolveConsent.current = resolve
      })
    } finally {
      setIsChecking(false)
    }
  }

  /** 기존 필수·민감정보 동의 상태를 유지하며 사진 처리 동의만 저장합니다. */
  const handleConfirm = async () => {
    if (isAccepting) return
    setIsAccepting(true)
    setError('')
    try {
      const current = await getLegalConsentStatus()
      const status = current.profileImageAgreed
        ? current
        : await acceptLegalConsents({
            termsOfServiceAgreed: current.termsOfServiceAgreed,
            privacyPolicyAcknowledged: current.privacyPolicyAcknowledged,
            sensitiveInformationAgreed: current.sensitiveInformationAgreed,
            profileImageAgreed: true,
          })
      if (!status.profileImageAgreed)
        throw new Error('프로필 이미지 처리 동의가 저장되지 않았습니다.')
      queryClient.setQueryData(['legal-consent', 'status'], status)
      if (!mounted.current) return
      setIsDialogOpen(false)
      resolveConsent.current?.(true)
      resolveConsent.current = null
    } catch (error) {
      if (mounted.current)
        setError(getApiErrorMessage(error, '동의를 저장하지 못했어요. 다시 시도해 주세요.'))
    } finally {
      setIsAccepting(false)
    }
  }

  /** 취소하면 업로드와 프로필 변경을 실행하지 않습니다. */
  const handleCancel = () => {
    if (isAccepting) return
    setIsDialogOpen(false)
    resolveConsent.current?.(false)
    resolveConsent.current = null
  }

  return {
    ensureConsent,
    isChecking,
    isDialogOpen,
    isAccepting,
    error,
    handleConfirm,
    handleCancel,
  }
}
