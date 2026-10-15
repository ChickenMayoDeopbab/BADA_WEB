let lockCount = 0
const lockedProperties = ['overflow', 'overflow-x', 'overflow-y', 'scrollbar-gutter'] as const
let lockedElements: {
  element: HTMLElement
  properties: { name: string; value: string; priority: string }[]
}[] = []

/** 중첩된 모달이 다른 순서로 닫혀도 마지막 모달이 닫힐 때만 스크롤을 복구합니다. */
export const lockPageScroll = () => {
  if (lockCount === 0) {
    const targets = new Set([
      document.body,
      document.documentElement,
      ...document.querySelectorAll<HTMLElement>('[data-scroll-lock-target]'),
    ])
    lockedElements = [...targets].map((element) => {
      const properties = lockedProperties.map((name) => ({
        name,
        value: element.style.getPropertyValue(name),
        priority: element.style.getPropertyPriority(name),
      }))
      const computed = getComputedStyle(element)
      const scrollbarWidth =
        element === document.documentElement
          ? window.innerWidth - element.clientWidth
          : element.offsetWidth -
            element.clientWidth -
            (parseFloat(computed.borderLeftWidth) || 0) -
            (parseFloat(computed.borderRightWidth) || 0)
      // 일반 스크롤바가 차지하던 공간을 유지해 잠금 시 콘텐츠가 밀리지 않게 합니다.
      if (scrollbarWidth > 0)
        element.style.setProperty(
          'scrollbar-gutter',
          computed.scrollbarGutter?.includes('stable') ? computed.scrollbarGutter : 'stable',
          'important',
        )
      element.style.setProperty('overflow', 'hidden', 'important')
      element.style.setProperty('overflow-x', 'hidden', 'important')
      element.style.setProperty('overflow-y', 'hidden', 'important')
      return { element, properties }
    })
  }
  lockCount += 1
  let isReleased = false
  return () => {
    if (isReleased) return
    isReleased = true
    lockCount -= 1
    if (lockCount === 0) {
      lockedElements.forEach(({ element, properties }) => {
        lockedProperties.forEach((name) => element.style.removeProperty(name))
        properties.forEach(({ name, value, priority }) => {
          if (value) element.style.setProperty(name, value, priority)
        })
      })
      lockedElements = []
    }
  }
}
