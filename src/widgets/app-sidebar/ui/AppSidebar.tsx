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
  <span className="relative flex size-7 shrink-0 items-center justify-center" aria-hidden="true">
    <span
      className="block size-7 bg-current"
      style={{
        WebkitMask: `url("${icon}") center / contain no-repeat`,
        mask: `url("${icon}") center / contain no-repeat`,
      }}
    />
    {hasNotificationBadge && (
      <span className="absolute right-1 top-[3px] size-[7px] rounded-full bg-[#ff0000]" />
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
      `flex h-12 w-full items-center gap-2 rounded-lg px-2 text-left text-lg font-medium tracking-[-0.36px] transition-colors duration-200 ${
        isActive
          ? hasNeutralActiveState
            ? 'bg-[#f8f8f8] text-[#2f2f2f]'
            : 'bg-[#e2fbe3] text-[#09c357]'
          : 'text-[#2f2f2f] hover:bg-[#f8f8f8]'
      }`
    }
  >
    <SidebarIcon icon={icon} hasNotificationBadge={label === '알림'} />
    <span>{label}</span>
  </NavLink>
)

// 애플리케이션 공통 사이드바를 표시합니다.
export const AppSidebar = () => (
  <aside className="sticky top-4 flex h-[calc(100vh-32px)] min-h-[720px] w-[233px] shrink-0 flex-col justify-between overflow-hidden rounded-3xl bg-[#fdfdfd] pb-1 pt-7 shadow-[0_2px_16px_rgba(0,0,0,0.08)]">
    <div className="flex flex-col gap-2.5">
      <div className="flex items-center justify-center border-b border-[#e9e9e9] py-5">
        <img src={badaLogo} alt="Bada" />
      </div>
      <nav className="px-3" aria-label="주요 메뉴">
        {primaryItems.map((item) => (
          <SidebarItem key={item.label} {...item} />
        ))}
      </nav>
    </div>

    <div className="flex flex-col gap-2.5">
      <nav className="px-3" aria-label="계정 메뉴">
        {utilityItems.map((item) => (
          <SidebarItem key={item.label} {...item} />
        ))}
      </nav>
      <div className="border-t border-[#e9e9e9] px-4 py-3">
        <div className="flex items-center gap-3">
          <img className="size-10 rounded-full" src={profileImage} alt="배준하 프로필" />
          <div className="min-w-0 leading-[1.3]">
            <p className="truncate text-lg font-bold tracking-[-0.36px] text-[#0d0d0e]">배준하</p>
            <p className="truncate text-sm tracking-[-0.28px] text-[#3b3d3e]">uhihi09</p>
          </div>
        </div>
      </div>
    </div>
  </aside>
)
