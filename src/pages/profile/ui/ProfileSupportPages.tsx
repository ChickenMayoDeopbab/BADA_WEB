import { InquiryForm, PaymentInterestForm } from '@features/support'
import { ServicePageContent } from '@shared/ui'
import { ProfileBackLink } from './ProfileBackLink'

/** 마이페이지에서 문의 작성 화면을 제공합니다. */
export const ProfileInquiryPage = () => {
  return (
    <ServicePageContent>
      <ProfileBackLink />
      <h1 className="my-5 text-title1 font-bold text-label-normal">{'문의하기'}</h1>
      <InquiryForm />
    </ServicePageContent>
  )
}

/** 유료 서비스 관심 등록 화면을 제공합니다. */
export const ProfilePaymentInterestPage = () => {
  return (
    <ServicePageContent>
      <ProfileBackLink />
      <h1 className="my-5 text-title1 font-bold text-label-normal">{'서비스 관심 등록'}</h1>
      <PaymentInterestForm />
    </ServicePageContent>
  )
}
