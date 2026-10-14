import backIcon from '@shared/assets/training-records/back-arrow.svg'

/** 시나리오 상세 화면의 원본 이전 아이콘을 20×40 비율 그대로 표시합니다. */
export const BackIcon = () => (
  <img src={backIcon} alt="" aria-hidden="true" width={20} height={40} className="h-10 w-5 shrink-0 object-contain" />
)
