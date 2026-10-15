import { useTranslation } from '@shared/lib'
import { experienceConfig } from '@shared/config'
import type { PropsWithChildren, ReactNode } from 'react'

/** 실제 요청을 기다리는 영역을 한 번만 안내합니다. 장식 막대는 읽지 않습니다. */
export const LoadingRegion = ({
  children,
  label = '불러오는 중',
  className = '',
}: PropsWithChildren<{ label?: string; className?: string }>) => {
  const { t } = useTranslation()
  return (
    <div role="status" aria-busy="true" aria-label={t(label)} className={className}>
      <span className="sr-only">{t(label)}</span>
      {experienceConfig.skeletons ? (
        <div aria-hidden="true">{children}</div>
      ) : (
        <div
          aria-hidden="true"
          className="gap-2 py-8 flex items-center justify-center text-label text-label-alternative"
        >
          <LoadingSpinner />
          {t(label)}
        </div>
      )}
    </div>
  )
}

/** 부모 레이아웃의 크기를 유지하는 재사용 가능한 스켈레톤입니다. */
export const Skeleton = ({ className = '' }: { className?: string }) =>
  experienceConfig.skeletons ? (
    <span
      aria-hidden="true"
      className={`ux-skeleton block rounded-control bg-fill-alternative ${className}`}
    />
  ) : (
    <span aria-hidden="true">—</span>
  )

/** 버튼과 처리 상태에서 사용할 작고 명확한 로딩 표시입니다. */
export const LoadingSpinner = ({ className = '' }: { className?: string }) => (
  <span
    aria-hidden="true"
    className={`ux-spinner size-4 inline-block shrink-0 rounded-pill border-2 border-current border-r-transparent ${className}`}
  />
)

/** 목록 행의 이미지·제목·설명 자리를 유지합니다. */
export const ListSkeleton = ({
  count = 3,
  label = '목록을 불러오는 중',
  className = '',
}: {
  count?: number
  label?: string
  className?: string
}) => {
  const { t } = useTranslation()
  return (
    <LoadingRegion label={t(label)} className={`space-y-3 ${className}`}>
      {Array.from({ length: count }, (_, index) => (
        <div
          key={index}
          className="gap-4 p-4 mb-3 flex min-h-[88px] items-center rounded-component border border-line-alternative bg-background-normal"
        >
          <Skeleton className="size-12 shrink-0 rounded-component" />
          <div className="min-w-0 space-y-3 flex-1">
            <Skeleton className="h-5 w-2/3" />
            <Skeleton className="h-3 w-1/2" />
          </div>
          <Skeleton className="h-4 w-12 shrink-0" />
        </div>
      ))}
    </LoadingRegion>
  )
}

/** 프로필·상세·설정의 데이터가 채워질 콘텐츠 형태를 유지합니다. */
export const ContentSkeleton = ({ label = '내용을 불러오는 중' }: { label?: string }) => {
  const { t } = useTranslation()
  return (
    <LoadingRegion label={t(label)} className="p-6 rounded-dialog bg-background-normal">
      <div className="gap-5 flex items-center">
        <Skeleton className="size-20 rounded-pill" />
        <div className="space-y-3 w-1/2">
          <Skeleton className="h-7 w-2/3" />
          <Skeleton className="h-4" />
        </div>
      </div>
      <div className="mt-6 space-y-4">
        <Skeleton className="h-12" />
        <Skeleton className="h-12" />
        <Skeleton className="h-24" />
      </div>
    </LoadingRegion>
  )
}

/** 빈 결과와 조회 오류에 다음 행동을 제공합니다. */
export const StatusState = ({
  title,
  description,
  onRetry,
  isRetrying = false,
  action,
  isError = false,
}: {
  title: string
  description?: string
  onRetry?: () => void
  isRetrying?: boolean
  action?: ReactNode
  isError?: boolean
}) => {
  const { t } = useTranslation()
  return (
    <div
      role={isError ? 'alert' : 'status'}
      className="gap-3 px-4 py-8 flex min-h-[120px] flex-col items-center justify-center text-center"
    >
      <p className="text-body font-medium text-label-neutral">{t(title)}</p>
      {description && <p className="text-label text-label-alternative">{t(description)}</p>}
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          disabled={isRetrying}
          aria-busy={isRetrying}
          className="gap-2 px-4 py-2 flex items-center rounded-control bg-fill-neutral text-label font-bold text-label-normal disabled:opacity-50"
        >
          {isRetrying && <LoadingSpinner />}
          {t('다시 불러오기')}
        </button>
      )}
      {action}
    </div>
  )
}
