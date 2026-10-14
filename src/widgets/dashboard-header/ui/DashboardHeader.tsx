import { WeeklyTrainingStrip } from './WeeklyTrainingStrip'
import { useCurrentUser } from '@entities/user'

// 사용자 인사말과 이번 주 훈련 현황을 표시합니다.
export const DashboardHeader = () => {
  const { data: user } = useCurrentUser()

  return (
    <header className="gap-5 flex h-[77px] items-start">
      <div className="min-w-0 gap-1 flex flex-1 flex-col">
        <h1 className="text-title1 font-bold text-label-normal">
          {user ? `다시 만나서 반가워요, ${user.name}님!` : '다시 만나서 반가워요!'}
        </h1>
        <p className="text-headline2 font-medium text-label-neutral">
          오늘은 어떤 시나리오로 연습할까요?
        </p>
      </div>
      <WeeklyTrainingStrip />
    </header>
  )
}
