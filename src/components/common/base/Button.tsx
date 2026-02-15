import React from "react"
import { Loader2 } from "lucide-react"

type ButtonVariant =
  | "primary"
  | "primaryOutline"
  | "secondary"
  | "secondaryOutline"
  | "accent"
  | "accentOutline"
  | "action"
  | "actionPrimary"
  | "support"
  | "warning"
  | "rowAdd"
  | "delete"
  | "mutedGray"
  | "mutedBlue"

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children?: React.ReactNode
  variant?: ButtonVariant
  className?: string
  icon?: React.ReactNode
  loading?: boolean
  onClick?: React.MouseEventHandler<HTMLButtonElement>
  disabledStyleOnly?: boolean
}

const defaultTextByVariant: Record<ButtonVariant, React.ReactNode> = {
  primary: null,
  primaryOutline: null,
  secondary: null,
  secondaryOutline: null,
  accent: null,
  accentOutline: null,
  action: null,
  actionPrimary: null,
  support: null,
  warning: null,
  rowAdd: "+ 새항목 추가",
  delete: null,
  mutedGray: null,
  mutedBlue: null,
}

const Button: React.FC<ButtonProps> = ({ children, variant = "primary", className = "", icon, loading = false, onClick, disabled, disabledStyleOnly = false, ...props }) => {
  const isDisabled = disabled || loading
  const base = `relative flex items-center justify-center gap-1 select-none whitespace-nowrap font-medium transition-opacity duration-200 px-2 sm:px-3 py-1 sm:py-1.5 text-[11px] sm:text-xs md:text-sm rounded-lg ${
    isDisabled || disabledStyleOnly ? "cursor-default" : "hover:opacity-80"
  }`
  let colors = ""
  const disabledColors = "bg-[#E3E9F2] text-[#9BB1D6] border border-[#E3E9F2]"

  switch (variant) {
    case "primary":
      colors = "bg-[var(--primary)] text-white px-3 py-1.5 md:px-6 md:py-3"
      break
    case "primaryOutline":
      colors = "bg-white text-[var(--primary)] border border-[var(--primary)] px-3 py-1.5 md:px-6 md:py-3"
      break
    case "delete":
      colors = "bg-gray-800 text-white px-3 py-1.5 md:px-6 md:py-3"
      break
    case "secondary":
      colors = "bg-[var(--secondary)] text-white"
      break
    case "secondaryOutline":
      colors = "bg-white text-[var(--secondary)] border border-[var(--secondary)]"
      break
    case "accent":
      colors = "bg-sky-600 text-white"
      break
    case "accentOutline":
      colors = "bg-white text-sky-600 border border-sky-600"
      break
    case "action":
      colors = "bg-gray-50 text-gray-600 border border-gray-200 hover:bg-gray-100"
      break
    case "actionPrimary":
      colors = "bg-[var(--tertiary)] text-white"
      break
    case "support":
      colors = "bg-gray-100 text-gray-700 border border-gray-300 hover:bg-gray-200"
      break
    case "warning":
      colors = "bg-[#FDEDED] text-[#901C1C] border border-[#D19EA3]"
      break
    case "rowAdd":
      colors = "bg-white text-[#161616] border border-[#161616]"
      break
    case "mutedGray":
      colors = "border-gray-300 text-gray-400 bg-gray-50 cursor-default"
      break
    case "mutedBlue":
      colors = "border-[var(--primary)] text-[var(--primary)] hover:bg-[var(--neutral-bg)]"
      break
    default:
      colors = "bg-[var(--primary)] text-white"
  }

  return (
    <button
      type={props.type || "button"}
      className={`${base} ${colors} ${isDisabled || disabledStyleOnly ? disabledColors : ""} ${className}`}
      onClick={e => {
        if (isDisabled) return
        onClick?.(e)
      }}
      disabled={isDisabled}
      {...props}
    >
      {loading && <Loader2 size={16} className="absolute animate-spin" />}
      <span className={`flex items-center gap-1 ${loading ? "invisible" : ""}`}>
        {icon && <span className="flex items-center">{icon}</span>}
        {children || defaultTextByVariant[variant]}
      </span>
    </button>
  )
}

export default Button
