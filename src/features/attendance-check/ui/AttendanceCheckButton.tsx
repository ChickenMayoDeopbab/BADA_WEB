import { LoadingSpinner } from '@shared/ui'
import { useAttendanceCheck } from '../model/useAttendanceCheck'

// 오늘 출석 버튼을 표시하고, 이미 출석한 경우 완료 상태로 비활성화합니다.
export const AttendanceCheckButton = () => {
  const { isCheckedToday, isChecking, isError, isDisabled, checkAttendance } = useAttendanceCheck()

  return (
    <div>
      <button
        type="button"
        aria-busy={isChecking}
        className="gap-2 h-11 flex w-full items-center justify-center rounded-component bg-primary-normal text-body font-bold text-label-button-text transition-colors disabled:cursor-default disabled:bg-fill-alternative disabled:text-neutral-70"
        disabled={isDisabled}
        onClick={checkAttendance}
      >
        {isChecking && <LoadingSpinner />}
        {isChecking ? '출석 확인 중' : isCheckedToday ? '오늘 출석 완료' : '오늘 출석하기'}
      </button>
      {isError && (
        <p role="alert" className="mt-2 text-caption text-status-error">
          {'출석하지 못했어요. 다시 시도해 주세요.'}
        </p>
      )}
    </div>
  )
}
