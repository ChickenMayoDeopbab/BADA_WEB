interface ServiceTabItem<Value extends string> {
  value: Value
  label: string
  width?: number
}

interface ServiceTabsProps<Value extends string> {
  items: readonly ServiceTabItem<Value>[]
  value: Value
  label: string
  onChange: (value: Value) => void
}

const tabGap = 15
const defaultTabWidth = 66

/** 서비스 페이지에 동일한 탭 규격과 선택 인디케이터 애니메이션을 제공합니다. */
export const ServiceTabs = <Value extends string>({
  items,
  value,
  label,
  onChange,
}: ServiceTabsProps<Value>) => {
  const activeIndex = items.findIndex((item) => item.value === value)
  const activeItem = items[activeIndex]
  const activeOffset = items
    .slice(0, Math.max(0, activeIndex))
    .reduce((offset, item) => offset + (item.width ?? defaultTabWidth) + tabGap, 0)

  return (
    <nav
      className="pb-2 relative flex shrink-0 items-center"
      style={{ gap: tabGap }}
      aria-label={label}
      role="tablist"
    >
      {items.map((item) => (
        <button
          key={item.value}
          type="button"
          role="tab"
          aria-selected={value === item.value}
          onClick={() => onChange(item.value)}
          className={`ease-out text-center text-title2 font-bold transition-colors duration-[420ms] motion-reduce:transition-none ${
            value === item.value
              ? 'text-primary-normal'
              : 'text-neutral-70 hover:text-label-neutral'
          }`}
          style={{ width: item.width ?? defaultTabWidth }}
        >
          {item.label}
        </button>
      ))}
      {activeItem && (
        <span
          className="bottom-0 left-0 h-0.5 ease-out pointer-events-none absolute bg-primary-normal transition-[transform,width] duration-[420ms] motion-reduce:transition-none"
          style={{
            width: activeItem.width ?? defaultTabWidth,
            transform: `translateX(${activeOffset}px)`,
          }}
          aria-hidden="true"
        />
      )}
    </nav>
  )
}
