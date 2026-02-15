import React from "react"

type ToggleSwitchProps = {
  checked: boolean
  onChange: (checked: boolean) => void
  disabled?: boolean
}

export default function ToggleSwitch({ checked, onChange, disabled = false }: ToggleSwitchProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-disabled={disabled}
      onClick={e => {
        e.stopPropagation()
        if (disabled) return
        onChange(!checked)
      }}
      className={`ml-0.5 relative inline-flex items-center h-6 w-10 rounded-full transition-colors duration-300 ease-in-out focus:outline-none ${
        checked ? (disabled ? "bg-[#9BB1D6]" : "bg-[var(--secondary)]") : disabled ? "bg-[#E3E9F2]" : "bg-gray-300"
      } ${disabled ? "cursor-default" : ""}`}
      disabled={disabled}
    >
      <span
        className={`flex items-center justify-center self-center w-5 h-5 rounded-full shadow transform transition-transform duration-300 ease-in-out ${
          checked ? "translate-x-[18px]" : "translate-x-[2px]"
        } ${disabled ? "bg-gray-100" : "bg-white"}`}
      />
    </button>
  )
}
