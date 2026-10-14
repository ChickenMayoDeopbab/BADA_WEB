import backIcon from '@shared/assets/training-records/back-arrow.svg'

/** 서비스 화면의 이전 가기 아이콘을 동일한 꺾쇠 모양으로 표시합니다. */
export const BackIcon = ({ className = 'size-5' }: { className?: string }) => (
  <img src={backIcon} alt="" aria-hidden="true" className={className} />
)
