import { useRef, useState, type KeyboardEvent } from 'react'

/** 모바일 구간 메뉴의 펼침과 Escape 키 초점 복원을 관리합니다. */
export const useSectionMenu = () => {
  const [isOpen, setIsOpen] = useState(false)
  const toggleRef = useRef<HTMLButtonElement>(null)

  /** Escape로 메뉴를 닫고 열기 버튼으로 초점을 되돌립니다. */
  const handleKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    if (event.key !== 'Escape' || !isOpen) return
    event.preventDefault()
    setIsOpen(false)
    toggleRef.current?.focus()
  }

  return {
    isOpen,
    toggleRef,
    handleKeyDown,
    toggle: () => setIsOpen((value) => !value),
    close: () => setIsOpen(false),
  }
}
