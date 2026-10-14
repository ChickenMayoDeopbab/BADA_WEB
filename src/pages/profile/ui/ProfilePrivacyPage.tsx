import { ProfileBackLink } from './ProfileBackLink'
import { FiChevronDown } from 'react-icons/fi'
import { useId, useState, type ReactNode } from 'react'
import { ConfirmDialog, ServicePageContent } from '@shared/ui'
import { getApiErrorMessage } from '@shared/api'
import { PRIVACY_POLICY_TEXT } from '../model/privacyPolicy'
import {
  PROFILE_IMAGE_SECTIONS,
  SENSITIVE_INFORMATION_SECTIONS,
  TERMS_OF_SERVICE_SECTIONS,
  type LegalDocumentSection,
} from '../model/legalDocuments'
import { usePrivacySettings, type OptionalConsent } from '../model/usePrivacySettings'

/** 앱의 개인정보 안내 문서 내용을 동일하게 표시합니다. */
const Sections = ({ sections }: { sections: LegalDocumentSection[] }) => (
  <div className="space-y-6">
    {sections.map(({ title, body }) => (
      <section key={title}>
        <h3 className="text-body font-bold text-label-normal">{title}</h3>
        <p className="mt-2 leading-relaxed text-label text-label-alternative">{body}</p>
      </section>
    ))}
  </div>
)

/** 문서의 실제 높이에 맞춰 펼침·접힘을 애니메이션하고 숨긴 문서는 접근성 트리에서도 제외합니다. */
const DocumentAccordion = ({
  title,
  expanded,
  onToggle,
  children,
}: {
  title: string
  expanded: boolean
  onToggle: () => void
  children: ReactNode
}) => {
  const id = useId()
  return (
    <section className="border-b border-line-alternative last:border-0">
      <h2>
        <button
          id={`${id}-button`}
          aria-expanded={expanded}
          aria-controls={id}
          onClick={onToggle}
          className="py-5 px-2 flex w-full items-center justify-between rounded-control text-left text-headline1 font-bold text-label-normal transition-colors duration-300 hover:bg-fill-normal motion-reduce:transition-none"
        >
          {title}
          <FiChevronDown
            aria-hidden="true"
            className={`size-6 ease-out shrink-0 text-label-alternative transition-transform duration-400 motion-reduce:transition-none ${expanded ? 'rotate-180' : ''}`}
          />
        </button>
      </h2>
      <div
        id={id}
        role="region"
        aria-labelledby={`${id}-button`}
        aria-hidden={!expanded}
        inert={!expanded}
        className={`ease-out grid transition-[grid-template-rows,opacity] duration-400 motion-reduce:transition-none ${expanded ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}
      >
        <div className="min-h-0 overflow-hidden">
          <div className="mb-5 p-6 max-sm:p-4 rounded-component bg-fill-normal">{children}</div>
        </div>
      </div>
    </section>
  )
}

/** 앱의 약관·이미지·민감정보 안내 및 선택 동의 관리 기능을 제공합니다. */
export const ProfilePrivacyPage = () => {
  const [confirming, setConfirming] = useState<OptionalConsent | null>(null)
  const [expandedDocument, setExpandedDocument] = useState<string | null>(null)
  const { status, update } = usePrivacySettings()
  const documents = [
    { title: '서비스 이용약관', content: <Sections sections={TERMS_OF_SERVICE_SECTIONS} /> },
    {
      title: '개인정보처리방침',
      content: (
        <p className="leading-relaxed text-label break-words whitespace-pre-wrap text-label-alternative">
          {PRIVACY_POLICY_TEXT.trim()}
        </p>
      ),
    },
    {
      title: '민감정보 처리 안내',
      content: <Sections sections={SENSITIVE_INFORMATION_SECTIONS} />,
    },
    { title: '프로필 이미지 처리 안내', content: <Sections sections={PROFILE_IMAGE_SECTIONS} /> },
  ]
  const consents: Array<{
    type: OptionalConsent
    title: string
    agreed: boolean
    description: string
  }> = [
    {
      type: 'profileImage',
      title: '프로필 이미지 처리 동의',
      agreed: status.data?.profileImageAgreed ?? false,
      description: status.data?.profileImageAgreed
        ? '현재 동의 상태입니다. 개인정보 관리에서 동의를 철회할 수 있습니다.'
        : '현재 미동의 상태입니다. 프로필 이미지를 등록하려면 동의가 필요합니다.',
    },
    {
      type: 'sensitive',
      title: '민감정보 처리 동의',
      agreed: status.data?.sensitiveInformationAgreed ?? false,
      description: status.data?.sensitiveInformationAgreed
        ? '현재 동의 상태입니다. 철회하면 진단 및 음성·훈련 분석 기능이 제한됩니다.'
        : '현재 미동의 상태입니다. 일반 서비스는 계속 이용할 수 있습니다.',
    },
  ]
  return (
    <ServicePageContent className="pb-10">
      <header className="mb-5 gap-3 flex flex-wrap items-center">
        <ProfileBackLink />
        <h1 className="text-title1 font-bold text-label-normal">개인정보 관리</h1>
      </header>
      <div className="space-y-4 max-w-[1024px]">
        <section className="p-6 max-sm:p-4 rounded-card border border-line-alternative bg-background-normal shadow-subtle-card">
          {documents.map(({ title, content }) => (
            <DocumentAccordion
              key={title}
              title={title}
              expanded={expandedDocument === title}
              onToggle={() => setExpandedDocument((current) => (current === title ? null : title))}
            >
              {content}
            </DocumentAccordion>
          ))}
        </section>
        {consents.map(({ type, title, agreed, description }) => (
          <section
            key={type}
            aria-label={title}
            className="p-6 max-sm:p-4 rounded-card border border-line-alternative bg-background-normal shadow-subtle-card"
          >
            <h2 className="text-headline1 font-bold text-label-normal">{title}</h2>
            <p className="mt-3 text-label text-label-alternative" role="status">
              {status.isPending
                ? '동의 상태를 확인하고 있습니다.'
                : status.isError
                  ? '동의 상태를 불러오지 못했습니다.'
                  : description}
            </p>
            {status.isError && (
              <button
                className="mt-3 text-label text-primary-normal"
                onClick={() => void status.refetch()}
              >
                다시 시도
              </button>
            )}
            <button
              className={`mt-5 px-6 py-3 rounded-component text-body font-bold transition-colors duration-300 disabled:opacity-50 motion-reduce:transition-none ${agreed ? 'bg-fill-normal text-label-normal hover:bg-fill-pressed' : 'bg-primary-normal text-label-button-text hover:bg-primary-normal/90'}`}
              disabled={status.isPending || status.isError || !status.data || update.isPending}
              onClick={() => {
                update.reset()
                if (agreed) setConfirming(type)
                else update.mutate({ type, agreed: true })
              }}
            >
              {update.isPending && update.variables?.type === type
                ? '처리 중...'
                : agreed
                  ? '동의 철회하기'
                  : '동의하기'}
            </button>
          </section>
        ))}
        {update.isError && !confirming && (
          <p role="alert" className="text-label text-status-error">
            {getApiErrorMessage(
              update.error,
              '동의 상태를 변경하지 못했습니다. 다시 시도해 주세요.',
            )}
          </p>
        )}
      </div>
      {confirming && (
        <ConfirmDialog
          title={`${confirming === 'profileImage' ? '프로필 이미지' : '민감정보'} 처리 동의를 철회할까요?`}
          description={
            confirming === 'profileImage'
              ? '철회 후 프로필 이미지를 등록하려면 다시 동의해야 합니다.'
              : '철회 후 통화불안 진단과 음성·훈련 분석 기능을 이용하려면 다시 동의해야 합니다.'
          }
          confirmLabel="철회하기"
          danger
          pending={update.isPending}
          error={
            update.isError
              ? getApiErrorMessage(update.error, '동의를 철회하지 못했습니다. 다시 시도해 주세요.')
              : undefined
          }
          onClose={() => setConfirming(null)}
          onConfirm={() =>
            update.mutate(
              { type: confirming, agreed: false },
              { onSuccess: () => setConfirming(null) },
            )
          }
        />
      )}
    </ServicePageContent>
  )
}
