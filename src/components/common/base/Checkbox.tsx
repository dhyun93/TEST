import React from "react"

interface CheckboxProps {
  checked: boolean
  onChange: () => void
  className?: string
  disabled?: boolean
}

const Checkbox: React.FC<CheckboxProps> = ({ checked, onChange, className = "", disabled = false }) => (
  <span
    onClick={e => {
      e.stopPropagation()
      if (!disabled) onChange()
    }}
    className={`inline-flex items-center justify-center select-none ${disabled ? "cursor-default opacity-50" : "cursor-pointer"} ${className}`}
    style={{
      width: 16,
      height: 16,
      borderRadius: 5,
      backgroundColor: checked ? "var(--secondary)" : "#fff",
      border: checked ? "none" : "1px solid #BFC5CC",
      transition: "background-color 0.2s, border 0.2s",
      userSelect: "none",
      verticalAlign: "middle",
      position: "relative",
    }}
    role="checkbox"
    aria-checked={checked}
    aria-disabled={disabled}
    tabIndex={disabled ? -1 : 0}
    onKeyDown={e => {
      if (!disabled && (e.key === "Enter" || e.key === " ")) {
        e.preventDefault()
        onChange()
      }
    }}
  >
    {checked && (
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="#fff"
        strokeWidth="3.3"
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{ display: "block" }}
        aria-hidden="true"
        focusable="false"
      >
        <path d="M20 6L9 17L4 12" />
      </svg>
    )}
  </span>
)

export default Checkbox
