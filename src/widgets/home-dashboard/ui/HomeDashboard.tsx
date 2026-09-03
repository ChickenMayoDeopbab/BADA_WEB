import type {
  Attendance,
  DashboardMetrics,
  ScenarioRecommendation,
  TrainingRecord,
  WeeklySummary,
} from '@features/home-dashboard'
import { IoCall, IoChevronBack, IoChevronForward } from 'react-icons/io5'
import { Link } from 'react-router-dom'

const weekDayNames = ['일', '월', '화', '수', '목', '금', '토']

type HomeDashboardProps = {
  userName?: string
  attendance: Attendance[]
  attendanceYear: number
  attendanceMonth: number
  recentTrainingRecords: TrainingRecord[]
  weeklySummary: WeeklySummary | null
  dashboardMetrics: DashboardMetrics | null
  scenarioRecommendation: ScenarioRecommendation | null
  hasAttendedToday: boolean
  isAttending: boolean
  onAttend: () => Promise<void>
  onPreviousAttendanceMonth: () => void
  onNextAttendanceMonth: () => void
}

const sessionTypeNames = {
  SCENARIO: '시나리오',
  CUSTOM: '커스텀',
  WARMUP: '워밍업',
}

// 초 단위 통화 시간을 분과 초로 표시한다.
const formatDuration = (durationSeconds: number) => {
  const minutes = Math.floor(durationSeconds / 60)
  const seconds = durationSeconds % 60

  if (minutes === 0) return `${seconds}초`
  return `${minutes}분 ${seconds}초`
}

// 날짜를 월과 일로 표시한다.
const formatTrainingDate = (trainedAt: string) => {
  const date = new Date(trainedAt)
  return `${date.getMonth() + 1}/${date.getDate()}`
}

// 오늘을 마지막으로 하는 최근 7일의 날짜를 만든다.
const getRecentSevenDates = () => {
  const today = new Date()

  return Array.from({ length: 7 }, (_, index) => {
    const date = new Date(today)
    date.setDate(today.getDate() - (6 - index))
    return date
  })
}

// 지표 점수를 그래프 높이 범위로 변환한다.
const getMetricBarHeight = (score: number) => Math.max(4, Math.min(100, score))

// 홈 대시보드 콘텐츠를 렌더링한다.
export default function HomeDashboard({
  userName,
  attendance,
  attendanceYear,
  attendanceMonth,
  recentTrainingRecords,
  weeklySummary,
  dashboardMetrics,
  scenarioRecommendation,
  hasAttendedToday,
  isAttending,
  onAttend,
  onPreviousAttendanceMonth,
  onNextAttendanceMonth,
}: HomeDashboardProps) {
  const today = new Date()
  const isCurrentAttendanceMonth =
    attendanceYear === today.getFullYear() && attendanceMonth === today.getMonth() + 1
  const recentSevenDates = getRecentSevenDates()
  const trainedDates = new Set(recentTrainingRecords.map(({ trainedAt }) => trainedAt.slice(0, 10)))
  const attendedDates = new Set(attendance.map(({ date }) => date))
  const firstDay = new Date(attendanceYear, attendanceMonth - 1, 1).getDay()
  const lastDate = new Date(attendanceYear, attendanceMonth, 0).getDate()
  const calendarDates = [
    ...Array.from({ length: firstDay }, () => null),
    ...Array.from({ length: lastDate }, (_, index) => index + 1),
  ]

  return (
    <>
      <section className="flex flex-col gap-1.5">
        <h1 className="text-2xl font-bold leading-[1.3] tracking-[-0.02em] md:text-[28px]">
          다시 만나서 반가워요{userName ? `, ${userName}님!` : '!'}
        </h1>
        <p className="text-base leading-[1.3] tracking-[-0.02em] text-[#5C5E5E]">오늘은 어떤 시나리오로 연습할까요?</p>
      </section>

      <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        <article className="flex h-[166px] flex-col items-start gap-2.5 rounded-2xl bg-gradient-to-r from-[#FF9E5E] to-[#FF7A2E] px-6 py-[22px] text-white">
          <p className="text-xs font-bold text-white/85">추천 시나리오</p>
          <h2 className="text-xl font-bold">{scenarioRecommendation?.scenario.title || '오늘의 추천 훈련'}</h2>
          <p className="text-xs text-white/85">{scenarioRecommendation?.scenario.content || '추천 시나리오를 준비하고 있어요'}</p>
          <Link className="rounded-[18px] bg-white px-3.5 py-2 text-sm font-bold text-[#0D0D0E]" to="/training/scenario">훈련 하러가기 →</Link>
        </article>
        <article className="flex h-[166px] flex-col items-start gap-2.5 rounded-2xl bg-[#006FCC] px-6 py-[22px] text-white">
          <p className="text-xs font-bold text-white/85">통화 전 워밍업</p>
          <h2 className="text-xl font-bold">긴장 풀고 가볍게 시작하기</h2>
          <p className="text-xs text-white/85">부담 없는 30초 통화로 목을 풀어요</p>
          <Link className="rounded-[18px] bg-white px-3.5 py-2 text-sm font-bold text-[#0D0D0E]" to="/training/warmup">워밍업 하러가기 →</Link>
        </article>
        <article className="flex min-h-[160px] flex-col items-start gap-3.5 rounded-2xl bg-[#F8F8F8] px-4 py-[22px] md:col-span-2 md:px-6 xl:col-span-1">
          <p className="text-sm font-medium text-[#5C5E5E]">이번 주 훈련</p>
          <div className="flex w-full justify-between gap-2">
            {recentSevenDates.map((date, index) => {
              const dateKey = date.toLocaleDateString('sv-SE')
              const isTrained = trainedDates.has(dateKey)
              const isToday = index === recentSevenDates.length - 1
              const dayLabel = isToday ? '오늘' : weekDayNames[date.getDay()]

              return (
              <div className="flex flex-col items-center gap-1.5" key={dateKey}>
                <span className={`flex h-[30px] w-[30px] items-center justify-center rounded-full ${isTrained ? 'bg-[#0AE365]' : isToday ? 'border-2 border-[#0AE365] bg-[#F8F8F8]' : 'bg-[#DADADB]'}`}>
                  {isTrained && <IoCall className="text-sm text-white" />}
                </span>
                <span className={`text-xs ${isToday ? 'font-bold text-[#0D0D0E]' : 'text-[#5C5E5E]'}`}>{dayLabel}</span>
              </div>
              )
            })}
          </div>
          <p className="text-sm font-bold">이번 주 {weeklySummary?.trainingCount ?? 0}회 훈련했어요</p>
        </article>
      </section>

      <section className="grid grid-cols-1 gap-4 xl:grid-cols-[792px_392px]">
        <article className="flex min-h-[244px] flex-col gap-3.5 overflow-hidden rounded-2xl bg-[#F8F8F8] px-4 py-[22px] md:px-6">
          <h2 className="text-lg font-bold">주간 지표</h2>
          <div className="flex gap-[18px] text-xs font-medium text-[#5C5E5E]">
            <span><i className="mr-1.5 inline-block h-2 w-2 rounded-full bg-[#0AE365]" />안정도</span>
            <span><i className="mr-1.5 inline-block h-2 w-2 rounded-full bg-[#378ADD]" />대화 유지</span>
            <span><i className="mr-1.5 inline-block h-2 w-2 rounded-full bg-[#E0A63C]" />유창성</span>
          </div>
          <div className="flex h-[112px] items-end justify-between gap-3 overflow-x-auto sm:gap-[30px] sm:justify-start md:justify-between">
            {dashboardMetrics?.dates.map((date, index) => {
              const bars = [
                dashboardMetrics.stabilityScores[index] ?? 0,
                dashboardMetrics.conversationScores[index] ?? 0,
                dashboardMetrics.fluencyScores[index] ?? 0,
              ]

              return (
              <div className="flex flex-col items-center gap-2" key={date}>
                <div className="flex items-end gap-1">
                  {bars.map((height, barIndex) => (
                    <span className={`w-3 rounded ${barIndex === 0 ? 'bg-[#0AE365]' : barIndex === 1 ? 'bg-[#378ADD]' : 'bg-[#E0A63C]'}`} key={barIndex} style={{ height: getMetricBarHeight(height) }} />
                  ))}
                </div>
                <span className="text-xs text-[#5C5E5E]">{weekDayNames[new Date(`${date}T00:00:00`).getDay()]}</span>
              </div>
              )
            })}
            {!dashboardMetrics?.dates.length && <p className="w-full self-center text-center text-sm text-[#5C5E5E]">이번 주 지표가 없어요.</p>}
          </div>
          <p className="text-xs text-[#5C5E5E]">각 지표는 높을수록 좋아요</p>
        </article>
        <article className="flex min-h-[210px] flex-col gap-3.5 rounded-2xl bg-[#F8F8F8] px-4 py-[22px] md:px-6">
          <h2 className="text-lg font-bold">주간 요약</h2>
          <p className="text-base font-bold">
            {weeklySummary ? `${weeklySummary.trainingCount}회 훈련 · 총 ${formatDuration(weeklySummary.totalCallDurationSeconds)}` : '이번 주 훈련 기록이 없어요'}
          </p>
          <p className="text-base leading-[1.3] tracking-[-0.02em]">{weeklySummary?.comment || '훈련을 시작하면 이번 주 요약을 확인할 수 있어요.'}</p>
          <p className="text-xs text-[#5C5E5E]">매주 월요일 아침에 업데이트돼요</p>
        </article>
      </section>

      <section className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <article className="flex min-h-[317px] flex-col gap-3.5 rounded-2xl bg-[#F8F8F8] px-4 py-[22px] md:px-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1">
              <button aria-label="이전 달 출석 기록 보기" className="flex h-7 w-7 items-center justify-center rounded-full text-[#5C5E5E] hover:bg-[#ECEDED]" onClick={onPreviousAttendanceMonth} type="button">
                <IoChevronBack />
              </button>
              <h2 className="min-w-[92px] text-center text-lg font-bold">{attendanceYear}년 {attendanceMonth}월</h2>
              {isCurrentAttendanceMonth ? (
                <span className="h-7 w-7" />
              ) : (
                <button aria-label="다음 달 출석 기록 보기" className="flex h-7 w-7 items-center justify-center rounded-full text-[#5C5E5E] hover:bg-[#ECEDED]" onClick={onNextAttendanceMonth} type="button">
                  <IoChevronForward />
                </button>
              )}
            </div>
            <span className="text-xs font-medium text-[#5C5E5E]">{attendance.length}일 출석했어요</span>
          </div>
          <div className="grid grid-cols-7 justify-items-center text-xs font-medium">
            {['일', '월', '화', '수', '목', '금', '토'].map((day, index) => <span className={index === 0 ? 'text-[#E24B4A]' : index === 6 ? 'text-[#378ADD]' : 'text-[#5C5E5E]'} key={day}>{day}</span>)}
          </div>
          <div className="grid flex-1 grid-cols-7 place-items-center gap-y-2">
            {calendarDates.map((date, index) => {
              const dateKey = date
                ? `${attendanceYear}-${String(attendanceMonth).padStart(2, '0')}-${String(date).padStart(2, '0')}`
                : ''
              const isAttended = attendedDates.has(dateKey)

              return date ? (
              <span className={`flex h-7 w-7 items-center justify-center rounded-full ${isAttended ? 'bg-[#0AE365]' : 'bg-[#ECEDED]'}`} key={dateKey} title={`${date}일`}>
                {isAttended && <IoCall className="text-sm text-white" />}
              </span>
              ) : <span className="h-7 w-7" key={`empty-${index}`} />
            })}
          </div>
          {isCurrentAttendanceMonth && (
            <button className="h-[38px] w-full rounded-[10px] bg-[#0AE365] text-base font-bold text-[#F6F6F6] disabled:cursor-default disabled:bg-[#DADADB]" disabled={hasAttendedToday || isAttending} onClick={() => void onAttend()}>
              {hasAttendedToday ? '오늘 출석 완료' : isAttending ? '출석 중...' : '오늘 출석하기'}
            </button>
          )}
        </article>
        <article className="flex min-h-[321px] flex-col gap-3.5 rounded-2xl bg-[#F8F8F8] px-4 py-[22px] md:px-6">
          <div className="flex items-center justify-between"><h2 className="text-lg font-bold">최근 훈련 기록</h2><Link className="text-sm font-bold text-[#0AE365]" to="/records">전체 보기 →</Link></div>
          <div>
            {recentTrainingRecords.slice(0, 4).map((training, index) => (
              <div className={`flex items-center justify-between py-2.5 ${index > 0 ? 'border-t border-[#DADADB]' : ''}`} key={training.recordId}>
                <div className="flex flex-col gap-1"><p className="text-base font-medium">{training.scenarioName}</p><p className="text-xs text-[#5C5E5E]">{sessionTypeNames[training.sessionType]} · {formatDuration(training.durationSeconds)}</p></div>
                <time className="text-sm text-[#5C5E5E]" dateTime={training.trainedAt}>{formatTrainingDate(training.trainedAt)}</time>
              </div>
            ))}
            {recentTrainingRecords.length === 0 && <p className="py-8 text-center text-sm text-[#5C5E5E]">아직 훈련 기록이 없어요.</p>}
          </div>
        </article>
      </section>
    </>
  )
}
