import { Header } from '@widgets/header'
import { Link } from 'react-router-dom'

type PlaceholderPageProps = {
  title: string
}

// 준비 중인 메뉴의 임시 화면을 렌더링한다.
export default function PlaceholderPage({ title }: PlaceholderPageProps) {
  return (
    <div className="min-h-screen bg-[#FEFEFE] text-[#0D0D0E]">
      <Header />
      <main className="mx-auto flex min-h-[calc(100vh-72px)] w-full max-w-[1200px] flex-col items-center justify-center gap-6 px-4 text-center md:px-6 xl:px-0">
        <h1 className="text-2xl font-bold">{title} 임시 화면입니다.</h1>
        <Link className="rounded-[10px] bg-[#0AE365] px-5 py-2.5 text-base font-bold text-white" to="/">
          홈으로 돌아가기
        </Link>
      </main>
    </div>
  )
}
