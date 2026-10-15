import { communityReportReasons, type CommunityReportTarget } from '../model/report'
import { useCommunityReport } from '../model/useCommunityReport'
import { getApiErrorMessage } from '@shared/api'
import { useEffect, useId, useRef } from 'react'

/** 기존 콘텐츠 메뉴에서 신고 사유를 선택하고 접수 결과를 확인합니다. */
export const CommunityReportDialog = ({
  target,
  onClose,
  onReported,
}: {
  target: CommunityReportTarget
  onClose: () => void
  onReported: () => void
}) => {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const id = useId()
  const report = useCommunityReport(target, onReported)

  useEffect(() => {
    const dialog = dialogRef.current
    const focused = document.activeElement as HTMLElement | null
    dialog?.showModal()
    const overflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      dialog?.close()
      document.body.style.overflow = overflow
      focused?.focus()
    }
  }, [])

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby={id}
      onCancel={(event) => {
        event.preventDefault()
        if (!report.isPending) onClose()
      }}
      className="p-6 m-auto w-[calc(100%-32px)] max-w-[400px] rounded-dialog border-0 bg-background-normal text-label-normal shadow-elevated-card backdrop:bg-common-100/40"
    >
      <h2 id={id} className="text-headline1 font-bold">
        {target.type === 'post' ? '게시글' : '댓글'} 신고
      </h2>
      <form
        onSubmit={(event) => {
          event.preventDefault()
          report.handleSubmit()
        }}
      >
        <fieldset disabled={report.isPending} className="mt-4 space-y-2">
          <legend className="mb-3 text-label text-label-alternative">
            신고 사유를 선택해 주세요.
          </legend>
          {communityReportReasons.map((option) => (
            <label
              key={option.value}
              className={`gap-3 p-3 flex items-center rounded-control text-label transition-colors duration-300 ${report.reason === option.value ? 'bg-primary-alternative' : 'bg-fill-normal'}`}
            >
              <input
                type="radio"
                name={id}
                value={option.value}
                checked={report.reason === option.value}
                onChange={() => report.setReason(option.value)}
                className="peer sr-only"
              />
              <span
                aria-hidden="true"
                data-radio-indicator
                className={`size-4 shrink-0 rounded-pill border transition-colors duration-300 peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-primary-normal ${report.reason === option.value ? 'border-primary-normal bg-primary-normal' : 'border-line-normal bg-background-normal'}`}
              />
              {option.label}
            </label>
          ))}
        </fieldset>
        {report.isError && (
          <p role="alert" className="mt-3 text-label text-status-error">
            {getApiErrorMessage(report.error, '신고를 접수하지 못했습니다. 다시 시도해 주세요.')}
          </p>
        )}
        <div className="mt-5 gap-3 grid grid-cols-2">
          <button
            autoFocus
            type="button"
            disabled={report.isPending}
            onClick={onClose}
            className="h-11 rounded-control bg-fill-normal text-label font-bold disabled:opacity-50"
          >
            취소
          </button>
          <button
            type="submit"
            disabled={!report.reason || report.isPending}
            className="h-11 rounded-control bg-primary-normal text-label font-bold text-label-strong disabled:opacity-50"
          >
            {report.isPending ? '신고 중...' : '신고하기'}
          </button>
        </div>
      </form>
    </dialog>
  )
}
