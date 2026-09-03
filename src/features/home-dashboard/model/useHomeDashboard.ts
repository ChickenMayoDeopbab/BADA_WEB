import { useEffect, useState } from 'react'
import {
  attendToday,
  getDashboardMetrics,
  getMonthlyAttendance,
  getRecentTrainingRecords,
  getScenarioRecommendation,
  getWeeklySummary,
} from '../api/homeDashboardApi'
import type {
  Attendance,
  DashboardMetrics,
  ScenarioRecommendation,
  TrainingRecord,
  WeeklySummary,
} from './types'

// 홈 대시보드 데이터를 관리한다.
export const useHomeDashboard = () => {
  const today = new Date()
  const currentYear = today.getFullYear()
  const currentMonth = today.getMonth() + 1
  const todayDateKey = today.toLocaleDateString('sv-SE')
  const [attendanceDate, setAttendanceDate] = useState(
    () => new Date(currentYear, currentMonth - 1, 1),
  )
  const [attendance, setAttendance] = useState<Attendance[]>([])
  const [recentTrainingRecords, setRecentTrainingRecords] = useState<TrainingRecord[]>([])
  const [weeklySummary, setWeeklySummary] = useState<WeeklySummary | null>(null)
  const [dashboardMetrics, setDashboardMetrics] = useState<DashboardMetrics | null>(null)
  const [scenarioRecommendation, setScenarioRecommendation] =
    useState<ScenarioRecommendation | null>(null)
  const [isAttending, setIsAttending] = useState(false)

  useEffect(() => {
    // 홈 대시보드 데이터를 불러온다.
    const loadHomeDashboard = async () => {
      const [trainingResult, summaryResult, metricsResult, recommendationResult] = await Promise.allSettled([
        getRecentTrainingRecords(),
        getWeeklySummary(),
        getDashboardMetrics(),
        getScenarioRecommendation(),
      ])

      if (trainingResult.status === 'fulfilled') {
        setRecentTrainingRecords(trainingResult.value.content)
      }
      if (summaryResult.status === 'fulfilled') setWeeklySummary(summaryResult.value)
      if (metricsResult.status === 'fulfilled') setDashboardMetrics(metricsResult.value)
      if (recommendationResult.status === 'fulfilled') {
        setScenarioRecommendation(recommendationResult.value)
      }
    }

    void loadHomeDashboard()
  }, [])

  useEffect(() => {
    // 선택한 달의 출석 기록을 불러온다.
    const loadMonthlyAttendance = async () => {
      try {
        const monthlyAttendance = await getMonthlyAttendance(
          attendanceDate.getFullYear(),
          attendanceDate.getMonth() + 1,
        )
        setAttendance(monthlyAttendance)
      } catch (error) {
        console.error(error)
      }
    }

    void loadMonthlyAttendance()
  }, [attendanceDate])

  // 이전 달 출석 기록으로 이동한다.
  const handlePreviousAttendanceMonth = () => {
    setAttendanceDate((date) => new Date(date.getFullYear(), date.getMonth() - 1, 1))
  }

  // 다음 달 출석 기록으로 이동한다.
  const handleNextAttendanceMonth = () => {
    setAttendanceDate((date) => {
      const nextMonth = new Date(date.getFullYear(), date.getMonth() + 1, 1)
      const currentMonthDate = new Date(currentYear, currentMonth - 1, 1)

      return nextMonth > currentMonthDate ? date : nextMonth
    })
  }

  const isCurrentAttendanceMonth =
    attendanceDate.getFullYear() === currentYear && attendanceDate.getMonth() + 1 === currentMonth
  const hasAttendedToday = isCurrentAttendanceMonth
    && attendance.some(({ date }) => date === todayDateKey)

  // 오늘 출석을 등록하고 월간 출석 기록을 갱신한다.
  const handleAttend = async () => {
    if (hasAttendedToday || isAttending) return

    try {
      setIsAttending(true)
      await attendToday()
      const updatedAttendance = await getMonthlyAttendance(
        attendanceDate.getFullYear(),
        attendanceDate.getMonth() + 1,
      )
      setAttendance(updatedAttendance)
    } catch (error) {
      console.error(error)
    } finally {
      setIsAttending(false)
    }
  }

  return {
    attendance,
    attendanceYear: attendanceDate.getFullYear(),
    attendanceMonth: attendanceDate.getMonth() + 1,
    recentTrainingRecords,
    weeklySummary,
    dashboardMetrics,
    scenarioRecommendation,
    hasAttendedToday,
    isAttending,
    handleAttend,
    handlePreviousAttendanceMonth,
    handleNextAttendanceMonth,
  }
}
