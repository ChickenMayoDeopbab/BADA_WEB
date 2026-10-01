import { TrainingRecordsView } from '@features/training-records'
import { AppSidebar } from '@widgets/app-sidebar'

// 훈련 기록 라우트의 전체 페이지 레이아웃을 구성합니다.
export default function TrainingRecordsPage() {
  return (
    <div className="flex min-h-screen min-w-[1180px] items-start gap-4 bg-[#f3f4f6] p-4">
      <AppSidebar />
      <TrainingRecordsView />
    </div>
  )
}
