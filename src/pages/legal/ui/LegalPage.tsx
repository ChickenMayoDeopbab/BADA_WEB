import { Link } from 'react-router-dom'
import { LuArrowLeft } from 'react-icons/lu'
import {
  TERMS_OF_SERVICE_SECTIONS,
  SENSITIVE_INFORMATION_SECTIONS,
  PRIVACY_POLICY_TEXT,
} from '@entities/legal-consent'
import { routePaths } from '@shared/config'
import logo from '@shared/assets/auth/logo.svg'

interface LegalPageProps {
  document: 'terms' | 'privacy' | 'sensitive'
}

const documents = {
  terms: { title: '서비스 이용약관', sections: TERMS_OF_SERVICE_SECTIONS },
  privacy: { title: '개인정보처리방침', sections: [] },
  sensitive: { title: '민감정보 처리 안내', sections: SENSITIVE_INFORMATION_SECTIONS },
}

/** 프로필과 동일한 정책 원문을 로그인 없이 확인할 수 있게 표시합니다. */
export const LegalPage = ({ document }: LegalPageProps) => {
  const { title, sections } = documents[document]
  return (
    <div className="min-h-screen bg-background-normal text-label-normal">
      <header className="border-b border-line-alternative">
        <div className="max-w-4xl gap-4 px-6 py-6 mx-auto flex items-center justify-between">
          <Link to={routePaths.landing} aria-label="BADA 홈">
            <img src={logo} alt="BADA" className="h-7 w-auto" />
          </Link>
          <Link to={routePaths.landing} className="min-h-11 gap-2 flex items-center text-label">
            <LuArrowLeft aria-hidden="true" />
            홈으로
          </Link>
        </div>
      </header>
      <main className="max-w-4xl px-6 py-12 sm:py-16 mx-auto">
        <h1 className="mb-10 sm:text-display2 text-title1 font-bold">{title}</h1>
        {document === 'privacy' ? (
          <p className="leading-relaxed text-label break-words whitespace-pre-wrap text-label-neutral">
            {PRIVACY_POLICY_TEXT.trim()}
          </p>
        ) : (
          <div className="space-y-8">
            {sections.map(({ title: sectionTitle, body }) => (
              <section key={sectionTitle}>
                <h2 className="text-headline2 font-bold">{sectionTitle}</h2>
                <p className="mt-3 leading-relaxed text-body text-label-neutral">{body}</p>
              </section>
            ))}
          </div>
        )}
        <nav
          aria-label="정책 문서"
          className="mt-12 gap-5 pt-6 flex flex-wrap border-t border-line-alternative text-label"
        >
          <Link to={routePaths.terms} aria-current={document === 'terms' ? 'page' : undefined}>
            이용약관
          </Link>
          <Link to={routePaths.privacy} aria-current={document === 'privacy' ? 'page' : undefined}>
            개인정보처리방침
          </Link>
          <Link
            to={routePaths.sensitiveInformation}
            aria-current={document === 'sensitive' ? 'page' : undefined}
          >
            민감정보 처리 안내
          </Link>
        </nav>
      </main>
    </div>
  )
}
