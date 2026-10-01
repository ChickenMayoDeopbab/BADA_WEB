interface PlaceholderPageProps {
  title: string
}

// 아직 구현되지 않은 공개 또는 집중형 화면의 위치를 표시합니다.
export const PlaceholderPage = ({ title }: PlaceholderPageProps) => (
  <main className="flex min-h-screen items-center justify-center bg-[#f3f4f6] p-10">
    <h1 className="text-4xl font-bold text-[#0d0d0e]">{title}</h1>
  </main>
)

// 공통 사이드바 안에서 아직 구현되지 않은 서비스 화면의 위치를 표시합니다.
export const ServicePlaceholderPage = ({ title }: PlaceholderPageProps) => (
  <main className="min-w-0 flex-1 p-16">
    <h1 className="text-[28px] font-bold tracking-[-0.56px] text-[#2f2f2f]">{title}</h1>
  </main>
)
