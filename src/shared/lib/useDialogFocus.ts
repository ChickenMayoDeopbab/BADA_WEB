import { lockPageScroll } from './lockPageScroll'
import { useEffect, useEffectEvent, useRef } from 'react'

const focusableSelector =
  'button:not(:disabled), a[href], input:not(:disabled), textarea:not(:disabled), select:not(:disabled), summary, [tabindex]:not([tabindex="-1"])'
const activeDialogs: HTMLElement[] = []

/** 사용자 정의 모달의 초점을 가두고 닫은 뒤 원래 버튼으로 돌려줍니다. */
export const useDialogFocus = <Element extends HTMLElement = HTMLDivElement>(
  isOpen: boolean,
  onClose: () => void,
  isPending = false,
) => {
  const ref = useRef<Element>(null)
  const close = useEffectEvent(() => {
    if (!isPending) onClose()
  })
  useEffect(() => {
    const panel = ref.current
    if (!isOpen || !panel) return
    const previous = document.activeElement as HTMLElement | null
    const releaseScroll = lockPageScroll()
    activeDialogs.push(panel)
    // 접혀 있거나 비활성화된 컨트롤을 초점 순서에서 제외합니다.
    const getFocusable = () =>
      Array.from(panel.querySelectorAll<HTMLElement>(focusableSelector)).filter(
        (element) =>
          !element.closest('[inert], [aria-hidden="true"]') && element.getClientRects().length > 0,
      )
    const frame = requestAnimationFrame(() =>
      (getFocusable()[0] ?? panel).focus({ preventScroll: true }),
    )
    // 최상위 모달의 키보드 탐색과 닫기를 처리합니다.
    const handleKeyDown = (event: KeyboardEvent) => {
      if (activeDialogs.at(-1) !== panel || document.querySelector('dialog[open]')) return
      if (event.key === 'Escape') {
        event.preventDefault()
        event.stopPropagation()
        close()
      }
      if (event.key !== 'Tab') return
      const elements = getFocusable()
      const first = elements[0]
      const last = elements.at(-1)
      if (!first) {
        event.preventDefault()
        panel.focus({ preventScroll: true })
        return
      }
      if (
        event.shiftKey &&
        (document.activeElement === first || !panel.contains(document.activeElement))
      ) {
        event.preventDefault()
        last?.focus({ preventScroll: true })
      } else if (
        !event.shiftKey &&
        (document.activeElement === last || !panel.contains(document.activeElement))
      ) {
        event.preventDefault()
        first.focus({ preventScroll: true })
      }
    }
    // 패널 내부의 스크롤을 허용하고 배경으로의 스크롤 전파만 막습니다.
    const stopBackgroundScroll = (event: Event) => {
      if (
        activeDialogs.at(-1) === panel &&
        !panel.contains(event.target as Node) &&
        !document.querySelector('dialog[open]')
      )
        event.preventDefault()
    }
    document.addEventListener('wheel', stopBackgroundScroll, { passive: false })
    document.addEventListener('touchmove', stopBackgroundScroll, { passive: false })
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      cancelAnimationFrame(frame)
      document.removeEventListener('keydown', handleKeyDown)
      document.removeEventListener('wheel', stopBackgroundScroll)
      document.removeEventListener('touchmove', stopBackgroundScroll)
      const index = activeDialogs.indexOf(panel)
      if (index >= 0) activeDialogs.splice(index, 1)
      releaseScroll()
      if (previous?.isConnected) previous.focus({ preventScroll: true })
    }
  }, [isOpen])
  return ref
}
