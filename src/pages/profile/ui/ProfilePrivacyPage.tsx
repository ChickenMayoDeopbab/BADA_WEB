import { getLegalConsentStatus, withdrawSensitiveInformationConsent } from '@entities/legal-consent'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { ProfileBackLink } from './ProfileBackLink'
import { FiChevronDown } from 'react-icons/fi'
import { useState } from 'react'
import { ConfirmDialog, ServicePageContent } from '@shared/ui'
import { PRIVACY_POLICY_TEXT } from '../model/privacyPolicy'

const terms = [
  ['서비스 이용', '바다는 전화 불안 완화와 대화 훈련을 돕는 서비스입니다. 회원은 관련 법령과 본 약관 및 서비스 운영정책을 준수해야 합니다.'],
  ['커뮤니티 운영정책', '바다는 부적절한 콘텐츠와 다른 사용자에 대한 괴롭힘, 욕설, 혐오, 위협 등 악의적인 행위를 허용하지 않습니다. 이러한 행위 또는 콘텐츠가 확인되는 경우 콘텐츠 삭제 및 서비스 이용 제한 등의 조치가 이루어질 수 있습니다.'],
  ['서비스 이용 제한', '운영정책을 위반하거나 서비스의 정상적인 운영을 방해한 경우 게시물 삭제, 기능 제한 또는 서비스 이용 제한 등의 조치가 이루어질 수 있습니다.'],
  ['문의', '서비스 이용약관 관련 문의: team.bada.service@gmail.com'],
]
const sensitive = [
  ['처리 항목', '통화불안 진단 응답과 점수, 음성 분석 결과, 진단·훈련 분석 결과 및 피드백을 처리합니다.'],
  ['처리 목적', '통화불안 진단, 불안 점수 저장, 음성 분석 및 개인화된 진단·훈련 결과와 피드백 제공에 사용합니다.'],
  ['동의 거부 및 철회', '민감정보 처리 동의는 선택 사항입니다. 동의하지 않아도 일반 서비스를 이용할 수 있으나 관련 진단·분석 기능은 제한됩니다. 동의 후에도 개인정보 관리 화면에서 언제든 철회할 수 있습니다.'],
]
const Sections = ({ sections }: { sections: string[][] }) => (
  <div className="space-y-6">
    {sections.map(([title, body]) => <section key={title}><h3 className="text-body font-bold text-label-normal">{title}</h3><p className="mt-2 text-label leading-relaxed text-label-alternative">{body}</p></section>)}
  </div>
)

export const ProfilePrivacyPage = () => {
  const [confirming, setConfirming] = useState(false)
  const queryClient = useQueryClient()
  const status = useQuery({ queryKey: ['legal-consent', 'status'], queryFn: getLegalConsentStatus })
  const withdrawal = useMutation({
    mutationFn: withdrawSensitiveInformationConsent,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['legal-consent'] })
    },
  })
  return (
    <ServicePageContent className="pb-10">
      <header className="mb-5 gap-3 flex flex-wrap items-center max-w-[1024px]">
        <ProfileBackLink />
        <h1 className="text-title1 font-bold text-label-normal">개인정보 관리</h1>
      </header>
      <div className="max-w-[1024px] space-y-4">
        <section className="p-6 max-sm:p-4 rounded-card border border-line-alternative bg-background-normal shadow-subtle-card">
          {[
            { title: '서비스 이용약관', content: <Sections sections={terms} /> },
            { title: '개인정보처리방침', content: <p className="whitespace-pre-wrap break-words text-label leading-relaxed text-label-alternative">{PRIVACY_POLICY_TEXT.trim()}</p> },
            { title: '민감정보 처리 안내', content: <Sections sections={sensitive} /> },
          ].map(({ title, content }) => (
            <details key={title} className="group border-b border-line-alternative last:border-0">
              <summary className="py-5 flex cursor-pointer list-none items-center justify-between text-headline1 font-bold text-label-normal">
                {title}<FiChevronDown aria-hidden="true" className="size-6 shrink-0 text-label-alternative transition-transform group-open:rotate-180" />
              </summary>
              <div className="mb-5 p-6 max-sm:p-4 rounded-component bg-fill-normal">{content}</div>
            </details>
          ))}
        </section>
        <section className="p-6 max-sm:p-4 rounded-card border border-line-alternative bg-background-normal shadow-subtle-card">
          <h2 className="text-headline1 font-bold text-label-normal">민감정보 처리 동의</h2>
          <p className="mt-3 text-label text-label-alternative" role="status">
            {status.isPending ? '동의 상태를 확인하고 있습니다.' : status.isError ? '동의 상태를 불러오지 못했습니다.' : status.data?.sensitiveInformationAgreed ? '현재 동의 상태입니다. 철회하면 진단 및 음성·훈련 분석 기능이 제한됩니다.' : '현재 동의하지 않은 상태입니다. 진단 및 분석 기능 이용 시 다시 동의할 수 있습니다.'}
          </p>
          {status.isError && <button className="mt-3 text-label text-primary-normal" onClick={() => void status.refetch()}>다시 시도</button>}
          {status.data?.sensitiveInformationAgreed && <button className="mt-5 px-6 py-3 rounded-component bg-fill-normal text-body font-bold text-label-normal disabled:opacity-50" disabled={withdrawal.isPending} onClick={() => {
            setConfirming(true)
          }}>{withdrawal.isPending ? '철회 중' : '동의 철회하기'}</button>}
          {withdrawal.isError && <p role="alert" className="mt-3 text-label text-status-error">동의를 철회하지 못했습니다. 다시 시도해 주세요.</p>}
        </section>
      </div>
      {confirming && <ConfirmDialog title="민감정보 처리 동의를 철회할까요?" description="철회 후 통화불안 진단과 음성·훈련 분석 기능을 이용하려면 다시 동의해야 합니다." confirmLabel="철회하기" danger pending={withdrawal.isPending} onClose={() => setConfirming(false)} onConfirm={() => withdrawal.mutate(undefined, {onSuccess: () => setConfirming(false)})} />}
    </ServicePageContent>
  )
}
