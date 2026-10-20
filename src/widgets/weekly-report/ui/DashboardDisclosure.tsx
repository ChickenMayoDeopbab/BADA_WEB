import type { ReactNode } from 'react'
import { IoCaretForward } from 'react-icons/io5'
import { experienceConfig } from '@shared/config'
import { useDashboardDisclosure } from '../model/useDashboardDisclosure'

/** 삼각형 화살표와 함께 내용을 부드럽게 펼치고 접습니다. */
export const DashboardDisclosure = ({
  title,
  children,
}: {
  title: string
  children: ReactNode
}) => {
  const { panelId, isExpanded, handleToggle } = useDashboardDisclosure()
  const motionClass = experienceConfig.accordionMotion ? 'ux-accordion' : 'transition-none'
  return (
    <div className="text-label text-label-neutral">
      <button
        type="button"
        aria-expanded={isExpanded}
        aria-controls={panelId}
        onClick={handleToggle}
        className="gap-2 py-1 flex w-full items-center text-left"
      >
        <IoCaretForward
          size={12}
          aria-hidden="true"
          className={`${motionClass} ease-out shrink-0 transition-transform motion-reduce:transition-none ${isExpanded ? 'rotate-90' : ''}`}
        />
        <span>{title}</span>
      </button>
      <div
        id={panelId}
        aria-hidden={!isExpanded}
        inert={!isExpanded}
        className={`${motionClass} ease-out grid transition-[grid-template-rows,opacity] motion-reduce:transition-none ${isExpanded ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}
      >
        <div className="min-h-0 overflow-hidden">
          <div className="pt-3">{children}</div>
        </div>
      </div>
    </div>
  )
}
