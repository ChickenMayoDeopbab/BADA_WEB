import type { ReactNode } from 'react'

interface PromoCardProps {
  eyebrow: string
  title: string
  description: string
  className: string
  action: ReactNode
}

export const promoActionClassName =
  'mt-auto h-9 gap-1.5 px-4 flex items-center rounded-pill bg-common-0 text-label font-bold text-label-normal'

// 대시보드 상단의 안내 카드 레이아웃을 표시합니다. CTA는 항상 카드 하단에 고정합니다.
export const PromoCard = ({ eyebrow, title, description, className, action }: PromoCardProps) => (
  <article
    className={`min-w-0 gap-1 px-6 py-3 rounded-2xl flex h-full flex-1 flex-col items-start overflow-hidden ${className}`}
  >
    <p className="text-caption font-bold text-common-0/85">{eyebrow}</p>
    <h2 className="max-w-full truncate text-title2 font-bold text-common-0">{title}</h2>
    <p className="max-w-full truncate text-label text-common-0/90">{description}</p>
    {action}
  </article>
)
