import { useRef, useState, type MouseEventHandler, type PointerEventHandler } from 'react'

interface DragState {
  pointerId: number | null
  startY: number
  scrollTop: number
  hasDragged: boolean
}

// 마우스로 세로 스크롤 영역을 잡아 끌 수 있게 합니다.
export const useDragScroll = () => {
  const scrollRef = useRef<HTMLDivElement>(null)
  const dragStateRef = useRef<DragState>({
    pointerId: null,
    startY: 0,
    scrollTop: 0,
    hasDragged: false,
  })
  const [isDragging, setIsDragging] = useState(false)

  const handlePointerDown: PointerEventHandler<HTMLDivElement> = (event) => {
    const target = event.target as HTMLElement

    if (event.pointerType !== 'mouse' || event.button !== 0 || target.closest('button')) {
      return
    }

    dragStateRef.current = {
      pointerId: event.pointerId,
      startY: event.clientY,
      scrollTop: event.currentTarget.scrollTop,
      hasDragged: false,
    }
    event.currentTarget.setPointerCapture(event.pointerId)
  }

  const handlePointerMove: PointerEventHandler<HTMLDivElement> = (event) => {
    const dragState = dragStateRef.current

    if (dragState.pointerId !== event.pointerId) {
      return
    }

    const distance = event.clientY - dragState.startY

    if (Math.abs(distance) > 3) {
      dragState.hasDragged = true
      setIsDragging(true)
    }

    event.currentTarget.scrollTop = dragState.scrollTop - distance
  }

  const handlePointerEnd: PointerEventHandler<HTMLDivElement> = (event) => {
    if (dragStateRef.current.pointerId !== event.pointerId) {
      return
    }

    event.currentTarget.releasePointerCapture(event.pointerId)
    dragStateRef.current.pointerId = null
    setIsDragging(false)

    window.setTimeout(() => {
      dragStateRef.current.hasDragged = false
    })
  }

  const handleClickCapture: MouseEventHandler<HTMLDivElement> = (event) => {
    if (!dragStateRef.current.hasDragged) {
      return
    }

    event.preventDefault()
    event.stopPropagation()
    dragStateRef.current.hasDragged = false
  }

  return {
    scrollRef,
    isDragging,
    dragScrollHandlers: {
      onPointerDown: handlePointerDown,
      onPointerMove: handlePointerMove,
      onPointerUp: handlePointerEnd,
      onPointerCancel: handlePointerEnd,
      onClickCapture: handleClickCapture,
    },
  }
}
