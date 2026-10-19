import { Link } from 'react-router-dom'
import { LuArrowUpRight } from 'react-icons/lu'
import { routePaths } from '@shared/config'
import { getWebEntry } from '../model/landingLinks'

interface WebStartLinkProps {
  children?: string
  destination?: string
  className?: string
}

/** 실제 웹 기능으로 이동하고 미로그인 이용자는 로그인 후 이어가도록 안내합니다. */
export const WebStartLink = ({
  children = '웹에서 시작하기',
  destination = routePaths.dashboard,
  className = '',
}: WebStartLinkProps) => (
  <Link {...getWebEntry(destination)} className={`brand-web-link ${className}`}>
    {children}
    <LuArrowUpRight className="size-5 shrink-0" aria-hidden="true" />
  </Link>
)
