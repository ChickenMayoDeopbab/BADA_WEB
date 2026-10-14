import { useAttendanceCheck } from '../model/useAttendanceCheck'

// 오늘 출석 버튼을 표시하고, 이미 출석한 경우 완료 상태로 비활성화합니다.
export const AttendanceCheckButton = () => {
  const { isCheckedToday, isDisabled, checkAttendance } = useAttendanceCheck()

  return (
    <button
      type="button"
      className="h-11 w-full rounded-component bg-primary-normal text-body font-bold text-label-button-text transition-colors disabled:cursor-default disabled:bg-fill-alternative disabled:text-neutral-70"
      disabled={isDisabled}
      onClick={checkAttendance}
    >
      {isCheckedToday ? '오늘 출석 완료' : '오늘 출석하기'}
    </button>
  )
}
