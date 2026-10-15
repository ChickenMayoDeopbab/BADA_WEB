import { useState } from 'react'
import { ConfirmDialog } from '@shared/ui'
import {
  communityReportReasons,
  type CommunityReportReason,
  type CommunityReportTarget,
} from '../model/report'

interface ReportCommunityContentDialogProps {
  target: CommunityReportTarget
  isPending: boolean
  error?: string
  onClose: () => void
  onConfirm: (reason: CommunityReportReason) => void
}

/** API가 지원하는 일곱 가지 사유 중 하나를 선택해야 신고할 수 있습니다. */
export const ReportCommunityContentDialog = ({
  target,
  isPending,
  error,
  onClose,
  onConfirm,
}: ReportCommunityContentDialogProps) => {
  const [reason, setReason] = useState<CommunityReportReason | null>(null)
  return (
    <ConfirmDialog
      title={`${target.label} 신고하기`}
      description={'신고 사유를 선택해 주세요. 검토 후 운영정책에 따라 조치합니다.'}
      confirmLabel={'신고하기'}
      danger
      pending={isPending}
      confirmDisabled={!reason}
      error={error}
      onClose={onClose}
      onConfirm={() => {
        if (reason && !isPending) onConfirm(reason)
      }}
    >
      <fieldset className="mt-4 space-y-1" disabled={isPending}>
        <legend className="sr-only">{'신고 사유'}</legend>
        {communityReportReasons.map((option) => (
          <label
            key={option.value}
            className={`gap-3 px-3 py-2 flex cursor-pointer items-center rounded-control text-label transition-colors duration-300 motion-reduce:transition-none ${reason === option.value ? 'bg-primary-alternative' : 'hover:bg-fill-normal'}`}
          >
            <input
              type="radio"
              name="report-reason"
              value={option.value}
              checked={reason === option.value}
              onChange={() => setReason(option.value)}
              className="peer sr-only"
            />
            <span
              aria-hidden="true"
              data-radio-indicator
              className={`size-4 shrink-0 rounded-pill border transition-colors duration-300 peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-primary-normal ${reason === option.value ? 'border-primary-normal bg-primary-normal' : 'border-line-normal bg-background-normal'}`}
            />
            {option.label}
          </label>
        ))}
      </fieldset>
    </ConfirmDialog>
  )
}
