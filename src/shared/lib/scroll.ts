/** 페이지 안의 목적지까지 짧게 가속·감속하며 이동하고 사용자 입력 시 즉시 중단합니다. */
export const scrollToPosition = (top: number, shouldAnimate = false) => {
  const target = Math.max(
    0,
    Math.min(top, document.documentElement.scrollHeight - window.innerHeight),
  )
  if (!shouldAnimate || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    window.scrollTo({ top: target, behavior: 'instant' })
    return () => {}
  }

  const start = window.scrollY
  const distance = target - start
  const duration = Math.min(500, Math.max(220, Math.abs(distance) * 0.08))
  let animationFrame = 0
  let startedAt: number | undefined

  /** 진행 중인 이동과 입력 이벤트 구독을 함께 해제합니다. */
  const cancel = () => {
    window.cancelAnimationFrame(animationFrame)
    window.removeEventListener('wheel', cancel)
    window.removeEventListener('touchstart', cancel)
    window.removeEventListener('pointerdown', cancel)
    window.removeEventListener('keydown', cancel)
  }

  /** 이동 거리에 관계없이 최대 0.5초 안에 목적지에 도착합니다. */
  const animate = (now: number) => {
    startedAt ??= now
    const progress = Math.min(1, (now - startedAt) / duration)
    const eased = progress < 0.5 ? 4 * progress ** 3 : 1 - (-2 * progress + 2) ** 3 / 2
    window.scrollTo({ top: start + distance * eased, behavior: 'instant' })
    if (progress < 1) animationFrame = window.requestAnimationFrame(animate)
    else cancel()
  }

  window.addEventListener('wheel', cancel, { passive: true })
  window.addEventListener('touchstart', cancel, { passive: true })
  window.addEventListener('pointerdown', cancel)
  window.addEventListener('keydown', cancel)
  animationFrame = window.requestAnimationFrame(animate)
  return cancel
}

/** 등장 효과의 transform에 영향을 받지 않는 문서 좌표와 섹션 여백을 계산합니다. */
export const getSectionScrollTop = (element: HTMLElement) => {
  let top = 0
  let current: HTMLElement | null = element
  while (current) {
    top += current.offsetTop
    current = current.offsetParent as HTMLElement | null
  }
  return top - (Number.parseFloat(window.getComputedStyle(element).scrollMarginTop) || 0)
}
