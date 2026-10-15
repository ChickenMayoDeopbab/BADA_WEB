import type { InputHTMLAttributes } from 'react'
import { IoSearch } from 'react-icons/io5'

interface ServiceSearchFieldProps extends Omit<
  InputHTMLAttributes<HTMLInputElement>,
  'type' | 'className'
> {
  label: string
}

/** 시나리오 훈련 기준의 크기와 포커스 스타일로 서비스 검색 입력을 표시합니다. */
export const ServiceSearchField = ({ label, ...inputProps }: ServiceSearchFieldProps) => (
  <label className="h-12 gap-2 px-4 flex w-[300px] max-w-full items-center rounded-component bg-fill-alternative text-label-alternative focus-within:outline-2 focus-within:outline-primary-normal">
    <span className="sr-only">{label}</span>
    <input
      {...inputProps}
      type="search"
      className="min-w-0 flex-1 bg-transparent text-body text-label-normal outline-none placeholder:text-neutral-70"
    />
    <IoSearch size={22} className="shrink-0" aria-hidden="true" />
  </label>
)
