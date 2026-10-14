let lockCount = 0
let previousOverflow: { body: string; root: string } | undefined

/** 중첩된 모달이 다른 순서로 닫혀도 마지막 모달이 닫힐 때만 스크롤을 복구합니다. */
export const lockPageScroll = () => {
  if (lockCount === 0) {
    previousOverflow = {
      body: document.body.style.overflow,
      root: document.documentElement.style.overflow,
    }
    document.body.style.overflow = 'hidden'
    document.documentElement.style.overflow = 'hidden'
  }
  lockCount += 1
  let isReleased = false
  return () => {
    if (isReleased) return
    isReleased = true
    lockCount -= 1
    if (lockCount === 0 && previousOverflow) {
      document.body.style.overflow = previousOverflow.body
      document.documentElement.style.overflow = previousOverflow.root
      previousOverflow = undefined
    }
  }
}
