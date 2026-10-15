import { Link } from 'react-router-dom'
import { routePaths } from '@shared/config'

interface PlaceholderPageProps {
  title: string
}

/** 공개 준비 화면과 찾을 수 없는 경로에 돌아갈 수 있는 행동을 제공합니다. */
export const PlaceholderPage = ({ title }: PlaceholderPageProps) => {
  return (
    <main className="ux-page gap-5 p-6 flex min-h-screen flex-col items-center justify-center bg-background-alternative text-center">
      <h1 className="text-display1 font-bold text-label-normal">{title}</h1>
      <p className="text-body text-label-alternative">
        {title === '페이지를 찾을 수 없습니다.'
          ? '주소를 확인하거나 로그인 화면으로 이동해 주세요.'
          : '바다에서 전화 훈련을 시작해 보세요.'}
      </p>
      <div className="gap-3 flex">
        <Link
          to={routePaths.login}
          className="px-5 py-3 rounded-component bg-fill-neutral text-body text-label-normal"
        >
          {'로그인'}
        </Link>
      </div>
    </main>
  )
}
