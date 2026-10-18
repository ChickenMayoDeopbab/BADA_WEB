import { AttendanceCalendar } from '@widgets/attendance-calendar'
import { DashboardHeader } from '@widgets/dashboard-header'
import { DashboardPromoCards } from '@widgets/dashboard-promo'
import { RecentTrainingRecords } from '@widgets/recent-training-records'
import { DashboardAnalytics } from '@widgets/dashboard-analytics'
import { ServicePageContent } from '@shared/ui'

// 대시보드 라우트의 전체 페이지 레이아웃을 구성합니다.
export default function DashboardPage() {
  return (
    <ServicePageContent className="gap-5 flex flex-col">
      <DashboardHeader />
      <div className="gap-4 px-8 py-7 max-lg:p-4 flex flex-col rounded-dialog bg-background-normal">
        <DashboardPromoCards />
        <DashboardAnalytics />
        <div className="gap-4 max-xl:flex-col flex">
          <AttendanceCalendar />
          <RecentTrainingRecords />
        </div>
      </div>
    </ServicePageContent>
  )
}
