import { BackIcon } from '@shared/ui'
import { routePaths } from '@shared/config'
import { Link } from 'react-router-dom'

export const ProfileBackLink = () => (
  <Link to={routePaths.profile} aria-label="프로필로 돌아가기" className="size-10 inline-flex shrink-0 items-center justify-center rounded-control text-headline1 text-label-normal transition-colors hover:bg-fill-normal">
    <BackIcon />
  </Link>
)
