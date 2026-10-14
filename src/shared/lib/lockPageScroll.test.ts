import { afterEach, describe, expect, it } from 'vitest'
import { lockPageScroll } from './lockPageScroll'

const releases: (() => void)[] = []

/** 실패한 검증 뒤에도 다음 테스트에 중첩 잠금이 남지 않게 정리합니다. */
afterEach(() => {
  releases.splice(0).forEach((release) => release())
  document.body.replaceChildren()
  document.body.removeAttribute('style')
  document.documentElement.removeAttribute('style')
})

/** 실제 서비스 영역처럼 별도로 스크롤되는 컨테이너를 준비합니다. */
const createScrollTarget = () => {
  const element = document.createElement('div')
  element.dataset.scrollLockTarget = ''
  document.body.append(element)
  return element
}

/** 중첩 잠금의 해제 함수를 테스트 종료 시에도 정리할 수 있게 보관합니다. */
const acquireLock = () => {
  const release = lockPageScroll()
  releases.push(release)
  return release
}

describe('lockPageScroll', () => {
  it('locks the service scroll containers as well as the document and preserves the scroll position', () => {
    const first = createScrollTarget()
    const second = createScrollTarget()
    first.scrollTop = 240
    const release = acquireLock()
    for (const element of [document.body, document.documentElement, first, second]) {
      expect(element.style.overflowY).toBe('hidden')
      expect(element.style.overflowX).toBe('hidden')
    }
    expect(first.scrollTop).toBe(240)
    release()
    expect(first.scrollTop).toBe(240)
    expect(first.style.overflowY).toBe('')
  })

  it('restores axis-specific styles, shorthand styles and priorities without clearing unrelated styles', () => {
    const target = createScrollTarget()
    target.style.setProperty('overflow-y', 'scroll', 'important')
    target.style.setProperty('overflow-x', 'clip')
    target.style.setProperty('scrollbar-gutter', 'stable both-edges', 'important')
    document.body.style.overflow = 'auto'
    Object.defineProperties(target, {
      offsetWidth: { value: 500 },
      clientWidth: { value: 470 },
    })
    const release = acquireLock()
    expect(target.style.getPropertyValue('scrollbar-gutter')).toBe('stable both-edges')
    target.style.color = 'red'
    release()
    expect(target.style.overflowY).toBe('scroll')
    expect(target.style.getPropertyPriority('overflow-y')).toBe('important')
    expect(target.style.overflowX).toBe('clip')
    expect(target.style.getPropertyValue('scrollbar-gutter')).toBe('stable both-edges')
    expect(target.style.getPropertyPriority('scrollbar-gutter')).toBe('important')
    expect(target.style.color).toBe('red')
    expect(document.body.style.overflow).toBe('auto')
    expect(document.documentElement.style.overflow).toBe('')
  })

  it('keeps every scroll root locked until the final dialog closes, even with repeated and out-of-order release', () => {
    const target = createScrollTarget()
    const outer = acquireLock()
    const inner = acquireLock()
    outer()
    outer()
    expect(target.style.overflowY).toBe('hidden')
    expect(document.body.style.overflowY).toBe('hidden')
    inner()
    expect(target.style.overflowY).toBe('')
    expect(document.body.style.overflow).toBe('')
    const next = acquireLock()
    expect(target.style.overflowY).toBe('hidden')
    next()
    expect(target.style.overflowY).toBe('')
  })

  it('reserves an existing scrollbar gutter during the lock and removes it on release', () => {
    const target = createScrollTarget()
    Object.defineProperties(target, {
      offsetWidth: { value: 500 },
      clientWidth: { value: 485 },
    })
    const release = acquireLock()
    expect(target.style.getPropertyValue('scrollbar-gutter')).toBe('stable')
    release()
    expect(target.style.getPropertyValue('scrollbar-gutter')).toBe('')
  })
})
