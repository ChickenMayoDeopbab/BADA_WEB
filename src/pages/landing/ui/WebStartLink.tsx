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
  <Link
    {...getWebEntry(destination)}
    className={`min-h-12 gap-5 px-6 py-3 ease-out inline-flex items-center justify-center rounded-pill bg-label-normal text-label font-medium text-background-normal transition-transform duration-200 hover:scale-105 motion-reduce:transition-none ${className}`}
  >
    {children}
    <LuArrowUpRight className="size-5 shrink-0" aria-hidden="true" />
  </Link>
)
