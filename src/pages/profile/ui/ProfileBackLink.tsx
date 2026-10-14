import { routePaths } from '@shared/config'
import { FiArrowLeft } from 'react-icons/fi'
import { Link } from 'react-router-dom'

export const ProfileBackLink = () => (
  <Link to={routePaths.profile} aria-label="프로필로 돌아가기" className="size-10 inline-flex shrink-0 items-center justify-center rounded-control text-headline1 text-label-normal transition-colors hover:bg-fill-normal">
    <FiArrowLeft aria-hidden="true" />
  </Link>
)
