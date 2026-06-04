import type { ReactNode } from "react"

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  bgColor: string,
  icon?: ReactNode,
  label: string,
  color?: string
}

export default function CustomButton({bgColor, icon, label, color, ...props}: ButtonProps) {
  return (
    <button 
      className={`w-full h-[45px] rounded-lg flex items-center gap-3 justify-center cursor-pointer`}
      style={{ backgroundColor: bgColor, color }} 
      {...props}
    >
      {icon}
      <span className="font-bold text-lg">{label}</span>
    </button>
  )
}