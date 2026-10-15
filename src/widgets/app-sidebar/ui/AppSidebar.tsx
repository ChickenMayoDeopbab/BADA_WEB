import { useUnreadNotificationCount } from '@entities/notification'
import { SidebarUserProfile } from './SidebarUserProfile'
import { LogoutButton } from '@features/auth'
import badaLogo from '@shared/assets/training-records/bada-logo.svg'
import bellIcon from '@shared/assets/training-records/nav-bell.svg'
import callIcon from '@shared/assets/training-records/nav-call.svg'
import communityIcon from '@shared/assets/training-records/nav-community.svg'
import historyIcon from '@shared/assets/training-records/nav-history.svg'
import homeIcon from '@shared/assets/training-records/nav-home.svg'
import logoutIcon from '@shared/assets/training-records/nav-logout.svg'
import profileIcon from '@shared/assets/training-records/nav-profile.svg'
import { routePaths } from '@shared/config'
import { IoNotifications } from 'react-icons/io5'
import { NavLink } from 'react-router-dom'

const primaryItems = [
  { label: '대시보드', icon: homeIcon, to: routePaths.dashboard, end: true },
  { label: '시나리오 훈련', icon: callIcon, to: routePaths.training },
  { label: '훈련 기록', icon: historyIcon, to: routePaths.records },
  { label: '커뮤니티', icon: communityIcon, to: routePaths.community },
  { label: '마이페이지', icon: profileIcon, to: routePaths.profile },
]

const utilityItems = [
  {
    label: '알림',
    icon: bellIcon,
    to: routePaths.notifications,
    hasNeutralActiveState: true,
  },
]

interface SidebarItemProps {
  label: string
  icon: string
  to: string
  end?: boolean
  hasNotificationBadge?: boolean
  hasNeutralActiveState?: boolean
}

interface SidebarIconProps {
  icon: string
  hasNotificationBadge?: boolean
}

// 원본 SVG 형태를 유지하면서 내비게이션 상태 색상을 상속합니다.
const SidebarIcon = ({ icon, hasNotificationBadge = false }: SidebarIconProps) => (
  <span className="size-7 relative flex shrink-0 items-center justify-center" aria-hidden="true">
    {icon === bellIcon ? (
      <IoNotifications className="size-7" />
    ) : (
      <span
        className="size-7 block bg-current"
        style={{
          WebkitMask: `url("${icon}") center / contain no-repeat`,
          mask: `url("${icon}") center / contain no-repeat`,
        }}
      />
    )}
    {hasNotificationBadge && (
      <span className="right-1 absolute top-[3px] size-[7px] rounded-pill bg-status-error" />
    )}
  </span>
)

// 사이드바 내비게이션 항목을 표시합니다.
const SidebarItem = ({
  label,
  icon,
  to,
  end = false,
  hasNeutralActiveState = false,
  hasNotificationBadge = false,
}: SidebarItemProps) => {
  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) =>
        `h-12 gap-2 px-2 max-md:h-auto max-md:min-w-0 max-md:flex-1 max-md:flex-col max-md:gap-1 max-md:px-1 max-md:py-2 flex w-full items-center rounded-control text-left text-headline2 font-medium transition-colors duration-200 ${
          isActive
            ? hasNeutralActiveState
              ? 'bg-fill-normal text-label-normal'
              : 'bg-primary-alternative text-primary-normal'
            : 'text-label-normal hover:bg-fill-normal'
        }`
      }
    >
      <SidebarIcon icon={icon} hasNotificationBadge={hasNotificationBadge} />
      <span className="max-md:text-caption max-md:whitespace-nowrap">{label}</span>
    </NavLink>
  )
}

// 애플리케이션 공통 사이드바를 표시합니다.
export const AppSidebar = () => {
  const { data: unreadCount = 0 } = useUnreadNotificationCount()
  return (
    <aside className="pb-1 pt-7 max-md:fixed max-md:inset-x-3 max-md:bottom-3 max-md:z-50 max-md:h-auto max-md:min-h-0 max-md:w-auto max-md:p-1 min-h-0 flex h-full w-[233px] shrink-0 flex-col justify-between overflow-hidden rounded-dialog bg-background-normal shadow-elevated-card">
      <div className="gap-2.5 max-md:gap-0 flex flex-col">
        <div className="py-5 max-md:hidden flex items-center justify-center border-b border-line-alternative">
          <img src={badaLogo} alt="Bada" />
        </div>
        <nav className="px-3 max-md:px-0 max-md:flex" aria-label={'주요 메뉴'}>
          {primaryItems.map((item) => (
            <SidebarItem key={item.label} {...item} />
          ))}
        </nav>
      </div>

      <div className="gap-2.5 max-md:hidden flex flex-col">
        <nav className="px-3" aria-label={'계정 메뉴'}>
          {utilityItems.map((item) => (
            <SidebarItem key={item.label} {...item} hasNotificationBadge={unreadCount > 0} />
          ))}
          <LogoutButton
            icon={<SidebarIcon icon={logoutIcon} />}
            labelClassName="text-headline2 font-medium"
            className="h-12 gap-2 px-2 flex w-full items-center rounded-control text-left text-headline2 font-medium text-label-normal transition-colors duration-200 enabled:hover:bg-status-error/10 enabled:hover:text-status-error disabled:cursor-wait disabled:opacity-50"
          />
        </nav>
        <div className="px-4 py-3 border-t border-line-alternative">
          <SidebarUserProfile />
        </div>
      </div>
    </aside>
  )
}
