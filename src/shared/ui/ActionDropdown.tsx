import { useEffect, useId, useRef, useState, type ReactNode } from 'react'

interface ActionDropdownProps {
  label: string
  icon: ReactNode
  items: { label: string; onSelect: () => void; isDisabled?: boolean; isDanger?: boolean }[]
  className?: string
  triggerClassName?: string
  placementClassName?: string
}

/** 마우스·키보드로 동일하게 이용하고 Escape/외부 클릭으로 닫을 수 있는 메뉴입니다. */
export const ActionDropdown = ({
  label,
  icon,
  items,
  className = 'w-40',
  triggerClassName = 'size-8 flex items-center justify-center rounded-pill text-label-alternative hover:bg-fill-normal',
  placementClassName = 'right-0 top-8',
}: ActionDropdownProps) => {
  const [isOpen, setIsOpen] = useState(false)
  const root = useRef<HTMLDivElement>(null)
  const trigger = useRef<HTMLButtonElement>(null)
  const menu = useRef<HTMLDivElement>(null)
  const id = useId()
  useEffect(() => {
    if (!isOpen) return
    const frame = requestAnimationFrame(() =>
      menu.current?.querySelector<HTMLButtonElement>('button:not(:disabled)')?.focus(),
    )
    // 메뉴 밖을 클릭하면 초점을 빼앗지 않고 닫습니다.
    const outside = (event: MouseEvent) => {
      if (!root.current?.contains(event.target as Node)) setIsOpen(false)
    }
    document.addEventListener('mousedown', outside)
    return () => {
      cancelAnimationFrame(frame)
      document.removeEventListener('mousedown', outside)
    }
  }, [isOpen])
  return (
    <div
      ref={root}
      className="relative"
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setIsOpen(false)
      }}
      onKeyDown={(event) => {
        if (event.key === 'Escape' && isOpen) {
          event.preventDefault()
          event.stopPropagation()
          setIsOpen(false)
          trigger.current?.focus()
        }
        if (event.key === 'Tab' && isOpen) {
          setIsOpen(false)
          trigger.current?.focus()
        }
      }}
    >
      <button
        ref={trigger}
        type="button"
        aria-label={label}
        aria-haspopup="menu"
        aria-expanded={isOpen}
        aria-controls={isOpen ? id : undefined}
        onClick={() => setIsOpen(!isOpen)}
        onKeyDown={(event) => {
          if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
            event.preventDefault()
            setIsOpen(true)
          }
        }}
        className={triggerClassName}
      >
        {icon}
      </button>
      {isOpen && (
        <div
          ref={menu}
          id={id}
          role="menu"
          aria-label={label}
          className={`ux-overlay ${placementClassName} absolute z-20 overflow-hidden rounded-control border border-line-alternative bg-background-normal shadow-elevated-card ${className}`}
          onKeyDown={(event) => {
            const buttons = Array.from(
              event.currentTarget.querySelectorAll<HTMLButtonElement>('button:not(:disabled)'),
            )
            const index = buttons.indexOf(document.activeElement as HTMLButtonElement)
            const next =
              event.key === 'Home'
                ? 0
                : event.key === 'End'
                  ? buttons.length - 1
                  : event.key === 'ArrowDown'
                    ? (index + 1) % buttons.length
                    : event.key === 'ArrowUp'
                      ? (index - 1 + buttons.length) % buttons.length
                      : null
            if (next !== null) {
              event.preventDefault()
              buttons[next]?.focus()
            }
          }}
        >
          {items.map((item) => (
            <button
              key={item.label}
              type="button"
              role="menuitem"
              tabIndex={-1}
              disabled={item.isDisabled}
              onClick={() => {
                setIsOpen(false)
                trigger.current?.focus()
                item.onSelect()
              }}
              className={`px-3 py-2 min-h-10 block w-full text-left text-label hover:bg-fill-normal disabled:opacity-50 ${item.isDanger ? 'text-status-error' : 'text-label-normal'}`}
            >
              {item.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
