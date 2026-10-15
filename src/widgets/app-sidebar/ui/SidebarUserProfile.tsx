import { useCurrentUser, useCurrentUserProfileImage } from '@entities/user'
import defaultProfileSummary from '@shared/assets/profile/default-profile-summary.svg'
import { useState } from 'react'

interface UserAvatarProps {
  imageUrl?: string
  name?: string
}

const UserAvatar = ({ imageUrl, name }: UserAvatarProps) => {
  const [failedImageUrl, setFailedImageUrl] = useState<string | null>(null)
  const label = name ? `${name} 프로필` : '사용자 프로필'

  if (imageUrl && imageUrl !== failedImageUrl) {
    return (
      <img
        className="size-10 rounded-pill object-cover"
        src={imageUrl}
        alt={label}
        onError={() => setFailedImageUrl(imageUrl)}
      />
    )
  }

  return (
    <div
      className="size-10 flex shrink-0 items-center justify-center rounded-pill bg-fill-normal"
      role="img"
      aria-label={label}
    >
      <img className="size-7" src={defaultProfileSummary} alt="" />
    </div>
  )
}

/** 사이드바에 로그인한 사용자의 프로필 요약을 표시합니다. */
export const SidebarUserProfile = () => {
  const currentUserQuery = useCurrentUser()
  const currentUser = currentUserQuery.data
  const profileImageQuery = useCurrentUserProfileImage(currentUser?.s3Key)

  return (
    <div className="gap-3 flex items-center">
      <UserAvatar imageUrl={profileImageQuery.data} name={currentUser?.name} />
      <div className="min-w-0 flex-1">
        {currentUserQuery.isPending ? (
          <div className="gap-1.5 animate-pulse flex flex-col" aria-label={'사용자 정보 로딩 중'}>
            <span className="h-5 w-20 rounded-control bg-fill-normal" />
            <span className="h-4 w-24 rounded-control bg-fill-normal" />
          </div>
        ) : (
          <>
            <p className="truncate text-headline2 font-bold text-label-normal">
              {currentUser?.name ?? '사용자'}
            </p>
            <p className="truncate text-label text-label-neutral">{currentUser?.username ?? ''}</p>
          </>
        )}
      </div>
    </div>
  )
}
