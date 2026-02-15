import React from "react"

type BadgeColor = "gray" | "red" | "yellow" | "green" | "blue" | "sky" | "orange" | "bgRed"

interface BadgeProps {
  color?: BadgeColor
  children: React.ReactNode
  selected?: boolean
  onClick?: () => void
  className?: string
}

interface TagProps {
  children: React.ReactNode
  className?: string
}

const colorStyles: Record<BadgeColor, string> = {
  gray: "bg-gray-100 text-gray-500",
  red: "bg-red-100 text-red-600",
  yellow: "bg-yellow-50 text-yellow-500",
  blue: "bg-blue-100 text-blue-800",
  sky: "bg-sky-100 text-sky-600",
  green: "bg-green-100 text-green-800",
  orange: "bg-orange-50 text-orange-500",
  bgRed: "bg-red-600 text-white",
}

const Badge: React.FC<BadgeProps> = ({ color = "gray", children, onClick, className = "" }) => (
  <span
    role={onClick ? "button" : undefined}
    tabIndex={onClick ? 0 : undefined}
    onClick={onClick}
    onKeyDown={e => {
      if (onClick && (e.key === "Enter" || e.key === " ")) {
        e.preventDefault()
        onClick()
      }
    }}
    className={`
inline-flex items-center rounded-full px-2 sm:px-3 py-0.5 sm:py-1
font-semibold text-[10px] sm:text-xs select-none
${colorStyles[color]}
${className}
`}
  >
    {children}
  </span>
)

export const Tag: React.FC<TagProps> = ({ children, className = "" }) => (
  <span className={`inline-flex items-center px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-md text-[10px] sm:text-xs border border-gray-300 bg-white text-gray-600 ${className}`}>{children}</span>
)

export { BadgeColor }
export default Badge
