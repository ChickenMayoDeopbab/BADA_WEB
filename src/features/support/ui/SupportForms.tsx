import { Link } from 'react-router-dom'
import { routePaths } from '@shared/config'
import { PrimaryButton, StatusState, LoadingSpinner } from '@shared/ui'
import { useInquiry, usePaymentInterest } from '../model/useSupport'

const fieldClass =
  'w-full rounded-control border border-line-normal bg-fill-field px-4 py-3 text-body text-label-normal focus:border-primary-normal focus:outline-none'

/** 서버로 전달할 문의 입력과 접수 결과를 표시합니다. */
export const InquiryForm = () => {
  const form = useInquiry()
  if (form.isSuccess)
    return (
      <section role="status" className="space-y-4 p-6 rounded-card bg-background-normal">
        <h2 className="text-title2 font-bold text-label-normal">{'문의를 접수했어요.'}</h2>
        <p className="text-body text-label-alternative">{'보내주신 내용을 확인하겠습니다.'}</p>
        <Link className="text-label text-primary-normal" to={routePaths.profile}>
          {'마이페이지로 돌아가기'}
        </Link>
      </section>
    )
  return (
    <form
      className="max-w-3xl space-y-5 p-6 rounded-card bg-background-normal"
      onSubmit={(event) => {
        event.preventDefault()
        form.handleSubmit()
      }}
    >
      <label className="space-y-2 block text-label text-label-normal">
        <span>{'제목'}</span>
        <input
          className={fieldClass}
          value={form.title}
          onChange={(event) => form.setTitle(event.target.value)}
          maxLength={100}
          required
          disabled={form.isSending}
        />
      </label>
      <label className="space-y-2 block text-label text-label-normal">
        <span>{'문의 내용'}</span>
        <textarea
          className={`${fieldClass} min-h-60 resize-y`}
          value={form.content}
          onChange={(event) => form.setContent(event.target.value)}
          maxLength={3000}
          required
          disabled={form.isSending}
        />
        <span className="block text-right text-caption text-label-alternative">
          {form.content.length}/3000
        </span>
      </label>
      {form.error && (
        <p role="alert" className="text-label text-status-error">
          {form.error}
        </p>
      )}
      <PrimaryButton type="submit" disabled={!form.canSubmit || form.isSending}>
        {form.isSending ? '전송 중' : '문의 보내기'}
      </PrimaryButton>
    </form>
  )
}

/** 실제 결제가 발생하지 않는 관심 등록과 서버에 저장된 상태를 표시합니다. */
export const PaymentInterestForm = () => {
  const interest = usePaymentInterest()
  return (
    <section className="max-w-3xl space-y-5 p-6 rounded-card bg-background-normal">
      <h2 className="text-title2 font-bold text-label-normal">{'유료 서비스 이용 의향'}</h2>
      <p className="text-body text-label-alternative">
        {
          '더 나은 훈련 기능을 준비하고 있어요. 유료 서비스 이용에 관심이 있다면 알려주세요. 관심을 등록해도 결제되거나 요금이 청구되지 않아요.'
        }
      </p>
      {interest.isLoading ? (
        <LoadingSpinner />
      ) : interest.isRegistered ? (
        <p role="status" className="text-body font-bold text-primary-normal">
          {'관심 등록을 완료했어요.'}
        </p>
      ) : (
        <PrimaryButton
          type="button"
          disabled={!interest.hasStatus || interest.isSaving}
          onClick={interest.register}
        >
          {interest.isSaving ? '등록 중' : '관심 등록하기'}
        </PrimaryButton>
      )}
      {interest.error && (
        <StatusState
          isError
          title={interest.error}
          onRetry={interest.hasStatus ? interest.register : interest.retry}
          isRetrying={interest.isSaving || interest.isLoading}
        />
      )}
    </section>
  )
}
