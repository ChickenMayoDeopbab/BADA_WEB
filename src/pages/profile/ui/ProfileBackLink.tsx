import { useTranslation } from '@shared/lib'
import { BackIcon } from '@shared/ui'
import { routePaths } from '@shared/config'
import { Link } from 'react-router-dom'

export const ProfileBackLink = () => {
  const { t } = useTranslation()
  return (
    <Link
      to={routePaths.profile}
      aria-label={t('프로필로 돌아가기')}
      className="size-10 inline-flex shrink-0 items-center justify-center rounded-control text-headline1 text-label-normal transition-colors hover:bg-fill-normal"
    >
      <BackIcon />
    </Link>
  )
}
