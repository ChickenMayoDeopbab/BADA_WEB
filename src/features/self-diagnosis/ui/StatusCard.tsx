import type { ReactNode } from 'react'
import { DiagnosisCard } from './DiagnosisCard'

type StatusCardProps = {
  icon?: string
  iconClassName?: string
  title: string
  description: string
  children?: ReactNode
}

// 계산 중, 계산 완료, 실패처럼 아이콘과 안내 문구만 있는 상태 카드입니다.
export const StatusCard = ({
  icon,
  iconClassName = 'size-[110px]',
  title,
  description,
  children,
}: StatusCardProps) => (
  <DiagnosisCard className="py-24">
    <div role="status" className="gap-8 flex flex-col items-center text-center">
      {icon && <img src={icon} alt="" className={iconClassName} />}
      <div className="gap-2.5 flex flex-col items-center">
        <h1 className="text-title2 font-bold text-label-normal">{title}</h1>
        <p className="text-body font-medium text-label-alternative">{description}</p>
      </div>
    </div>
    {children && <div className="mt-8 w-full">{children}</div>}
  </DiagnosisCard>
)
