import badaLogo from '@shared/assets/badaLogo2.svg'
import headerActions from '@shared/assets/headerActions.svg'
import { IoPerson } from 'react-icons/io5'
import { Link, NavLink } from 'react-router-dom'

const navigationItems = [
  { label: '홈', path: '/' },
  { label: '훈련', path: '/training' },
  { label: '기록', path: '/records' },
  { label: '커뮤니티', path: '/community' },
  { label: '프로필', path: '/profile' },
]

type HeaderProps = {
  profileImageUrl?: string | null
}

// 홈 화면의 상단 내비게이션을 렌더링한다.
export default function Header({ profileImageUrl }: HeaderProps) {
  return (
    <header className="h-[72px] border-b border-[#DADADB] bg-[#FEFEFE]">
      <div className="mx-auto flex h-full w-full max-w-[1200px] items-center justify-between px-4 md:px-6 xl:px-0">
        <Link to="/" aria-label="홈으로 이동">
          <img className="h-[29px] w-[63px]" src={badaLogo} alt="바다" />
        </Link>
        <nav className="hidden md:block" aria-label="주요 메뉴">
          <ul className="flex gap-5 text-sm font-medium leading-[1.3] tracking-[-0.02em] lg:gap-9 lg:text-base">
            {navigationItems.map(({ label, path }) => (
              <li key={path}>
                <NavLink className={({ isActive }) => isActive ? 'text-[#0AE365]' : 'text-[#5C5E5E]'} end={path === '/'} to={path}>
                  {label}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
        <div className="relative h-8 w-[76px]">
          <img className="h-8 w-[76px]" src={headerActions} alt="알림과 프로필" />
          <Link className="absolute left-0 top-0 h-8 w-8 rounded-full" to="/notifications" aria-label="알림으로 이동" />
          <Link className="absolute right-0 top-0 flex h-8 w-8 items-center justify-center rounded-full bg-[#FFD84D]" to="/profile" aria-label="프로필로 이동">
            <IoPerson className="text-lg text-[#5C4A00]" />
            {profileImageUrl && (
              <img className="absolute inset-0 h-8 w-8 rounded-full object-cover" src={profileImageUrl} alt="프로필" />
            )}
          </Link>
        </div>
      </div>
    </header>
  )
}
