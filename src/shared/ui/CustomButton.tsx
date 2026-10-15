import type { ReactNode } from 'react'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  bgColor: string
  icon?: ReactNode
  label: string
  color?: string
  fontSize?: string
  rounded?: string
}

export default function CustomButton({
  bgColor,
  icon,
  label,
  color,
  fontSize = 'text-lg',
  rounded = 'rounded-lg',
  ...props
}: ButtonProps) {
  return (
    <button
      className={`h-[45px] w-full ${rounded} gap-3 flex cursor-pointer items-center justify-center`}
      style={{ backgroundColor: bgColor, color }}
      {...props}
    >
      {icon}
      <span className={`font-bold ${fontSize}`}>{label}</span>
    </button>
  )
}
