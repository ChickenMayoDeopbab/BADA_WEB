import { experienceConfig } from '@shared/config'

/** 닫힘 애니메이션이 없으면 즉시 패널을 정리합니다. 요청 지연으로 사용하지 않습니다. */
export const getDrawerCloseDelay = () =>
  experienceConfig.drawerMotion && !window.matchMedia('(prefers-reduced-motion: reduce)').matches
    ? experienceConfig.durations.drawerExit
    : 0
