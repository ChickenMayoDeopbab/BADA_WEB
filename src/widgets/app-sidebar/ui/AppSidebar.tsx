import badaLogo from '@shared/assets/training-records/bada-logo.svg'
import bellIcon from '@shared/assets/training-records/nav-bell.svg'
import callIcon from '@shared/assets/training-records/nav-call.svg'
import communityIcon from '@shared/assets/training-records/nav-community.svg'
import historyIcon from '@shared/assets/training-records/nav-history.svg'
import homeIcon from '@shared/assets/training-records/nav-home.svg'
import logoutIcon from '@shared/assets/training-records/nav-logout.svg'
import profileIcon from '@shared/assets/training-records/nav-profile.svg'
import profileImage from '@shared/assets/training-records/profile.png'
import { routePaths } from '@shared/config'
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
  { label: '로그아웃', icon: logoutIcon, to: routePaths.landing, end: true },
]

interface SidebarItemProps {
  label: string
  icon: string
  to: string
  end?: boolean
  hasNeutralActiveState?: boolean
}

interface SidebarIconProps {
  icon: string
  hasNotificationBadge?: boolean
}

// 원본 SVG 형태를 유지하면서 내비게이션 상태 색상을 상속합니다.
const SidebarIcon = ({ icon, hasNotificationBadge = false }: SidebarIconProps) => (
  <span className="size-7 relative flex shrink-0 items-center justify-center" aria-hidden="true">
    <span
      className="size-7 block bg-current"
      style={{
        WebkitMask: `url("${icon}") center / contain no-repeat`,
        mask: `url("${icon}") center / contain no-repeat`,
      }}
    />
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
}: SidebarItemProps) => (
  <NavLink
    to={to}
    end={end}
    className={({ isActive }) =>
      `h-12 gap-2 px-2 flex w-full items-center rounded-control text-left text-headline2 font-medium transition-colors duration-200 ${
        isActive
          ? hasNeutralActiveState
            ? 'bg-fill-normal text-label-normal'
            : 'bg-primary-alternative text-primary-normal'
          : 'text-label-normal hover:bg-fill-normal'
      }`
    }
  >
    <SidebarIcon icon={icon} hasNotificationBadge={label === '알림'} />
    <span>{label}</span>
  </NavLink>
)

// 애플리케이션 공통 사이드바를 표시합니다.
export const AppSidebar = () => (
  <aside className="top-4 pb-1 pt-7 sticky flex h-[calc(100vh-32px)] min-h-[720px] w-[233px] shrink-0 flex-col justify-between overflow-hidden rounded-dialog bg-background-normal shadow-[0_2px_16px_rgba(0,0,0,0.08)]">
    <div className="gap-2.5 flex flex-col">
      <div className="py-5 flex items-center justify-center border-b border-line-alternative">
        <img src={badaLogo} alt="Bada" />
      </div>
      <nav className="px-3" aria-label="주요 메뉴">
        {primaryItems.map((item) => (
          <SidebarItem key={item.label} {...item} />
        ))}
      </nav>
    </div>

    <div className="gap-2.5 flex flex-col">
      <nav className="px-3" aria-label="계정 메뉴">
        {utilityItems.map((item) => (
          <SidebarItem key={item.label} {...item} />
        ))}
      </nav>
      <div className="px-4 py-3 border-t border-line-alternative">
        <div className="gap-3 flex items-center">
          <img className="size-10 rounded-pill" src={profileImage} alt="배준하 프로필" />
          <div className="min-w-0">
            <p className="truncate text-headline2 font-bold text-label-normal">배준하</p>
            <p className="truncate text-label text-label-neutral">uhihi09</p>
          </div>
        </div>
      </div>
    </div>
  </aside>
)
