import { useTranslation } from '@shared/lib'
import { LoadingRegion, Skeleton } from '@shared/ui'

/** 프로필 요약·수정 화면의 실제 카드, 사진과 입력 영역 크기를 유지합니다. */
export const ProfileSkeleton = ({ isEditing = false }: { isEditing?: boolean }) => {
  const { t } = useTranslation()
  return (
    <LoadingRegion
      label={t('프로필 정보를 불러오는 중')}
      className={isEditing ? 'max-w-[1024px]' : ''}
    >
      {isEditing ? (
        <div className="max-lg:flex-col flex min-h-[720px] overflow-hidden rounded-card border border-line-alternative bg-background-normal">
          <div className="gap-6 p-6 max-lg:w-full flex w-[300px] shrink-0 flex-col items-center bg-fill-normal">
            <Skeleton className="size-[92px] rounded-pill" />
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-12 w-48" />
          </div>
          <div className="space-y-6 p-6 min-w-0 flex-1">
            <Skeleton className="h-7 w-32" />
            <Skeleton className="h-4 w-2/3" />
            <div className="gap-6 max-sm:grid-cols-1 grid grid-cols-2">
              <Skeleton className="h-20" />
              <Skeleton className="h-20" />
            </div>
            <Skeleton className="h-20" />
            <Skeleton className="h-28" />
          </div>
        </div>
      ) : (
        <div className="gap-4 max-sm:grid-cols-1 grid grid-cols-3">
          <div className="gap-6 p-6 max-sm:col-span-1 col-span-3 flex items-center rounded-card border border-line-alternative bg-background-normal">
            <Skeleton className="size-20 shrink-0 rounded-pill" />
            <div className="space-y-3 flex-1">
              <Skeleton className="h-7 w-1/2" />
              <Skeleton className="h-4 w-2/3" />
            </div>
          </div>
          {[0, 1, 2].map((key) => (
            <div
              key={key}
              className="space-y-3 p-6 h-32 rounded-card border border-line-alternative bg-background-normal"
            >
              <Skeleton className="h-4 w-2/3" />
              <Skeleton className="h-7 w-1/2" />
            </div>
          ))}
          <div className="space-y-4 p-5 max-sm:col-span-1 col-span-3 rounded-card border border-line-alternative bg-background-normal">
            <Skeleton className="h-6 w-32" />
            {[0, 1, 2].map((key) => (
              <Skeleton key={key} className="h-16" />
            ))}
          </div>
        </div>
      )}
    </LoadingRegion>
  )
}
