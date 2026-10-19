import { ConfirmDialog } from '@shared/ui'
import { PROFILE_IMAGE_SECTIONS } from '@entities/legal-consent'
import type { useProfileImageConsent } from '../model/useProfileImageConsent'

/** 사진 처리 항목·보유 기간·철회 방법을 안내한 뒤 선택 동의를 받습니다. */
export const ProfileImageConsentDialog = ({
  consent,
}: {
  consent: ReturnType<typeof useProfileImageConsent>
}) => {
  return consent.isDialogOpen ? (
    <ConfirmDialog
      title={'프로필 이미지 처리에 동의할까요?'}
      description={PROFILE_IMAGE_SECTIONS.map(
        (section) => `${section.title}: ${section.body}`,
      ).join('\n\n')}
      confirmLabel={'동의하고 저장'}
      pending={consent.isAccepting}
      error={consent.error}
      onClose={consent.handleCancel}
      onConfirm={() => void consent.handleConfirm()}
    />
  ) : null
}
