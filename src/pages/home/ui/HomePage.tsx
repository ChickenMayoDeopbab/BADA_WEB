import { useUserProfile } from '@entities/user'
import { useHomeDashboard } from '@features/home-dashboard'
import { HomeDashboard } from '@widgets/home-dashboard'
import { Header } from '@widgets/header'

// 홈 대시보드 페이지를 렌더링한다.
export default function HomePage() {
  const userProfile = useUserProfile()
  const homeDashboard = useHomeDashboard()

  return (
    <div className="min-h-screen bg-[#FEFEFE] text-[#0D0D0E]">
      <Header profileImageUrl={userProfile?.profileImageUrl} />
      <main className="mx-auto flex w-full max-w-[1200px] flex-col gap-6 px-4 pb-12 pt-6 md:px-6 md:pb-16 md:pt-8 xl:px-0 xl:pb-20">
        <HomeDashboard
          userName={userProfile?.name}
          attendance={homeDashboard.attendance}
          attendanceYear={homeDashboard.attendanceYear}
          attendanceMonth={homeDashboard.attendanceMonth}
          recentTrainingRecords={homeDashboard.recentTrainingRecords}
          weeklySummary={homeDashboard.weeklySummary}
          dashboardMetrics={homeDashboard.dashboardMetrics}
          scenarioRecommendation={homeDashboard.scenarioRecommendation}
          hasAttendedToday={homeDashboard.hasAttendedToday}
          isAttending={homeDashboard.isAttending}
          onAttend={homeDashboard.handleAttend}
          onPreviousAttendanceMonth={homeDashboard.handlePreviousAttendanceMonth}
          onNextAttendanceMonth={homeDashboard.handleNextAttendanceMonth}
        />
      </main>
    </div>
  )
}
