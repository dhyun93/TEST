import React, { useState, useRef, useEffect } from "react"
import { createPortal } from "react-dom"
import { ChevronDown } from "lucide-react"

interface CustomSelectProps {
  value: string
  onChange: (value: string) => void
  options: ReadonlyArray<{ value: string; label: string; id?: number }>
  className?: string
  buttonClassName?: string
}

const CustomSelect: React.FC<CustomSelectProps> = ({ value, onChange, options, className = "", buttonClassName = "" }) => {
  const [open, setOpen] = useState(false)
  const [dropdownStyle, setDropdownStyle] = useState<React.CSSProperties>({})
  const ref = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)
  const dropdownRef = useRef<HTMLUListElement>(null)

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node
      if (ref.current && !ref.current.contains(target) && dropdownRef.current && !dropdownRef.current.contains(target)) {
        setOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const updatePosition = () => {
    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect()
      setDropdownStyle({
        position: "fixed",
        top: rect.bottom + 2,
        left: rect.left,
        width: rect.width,
        zIndex: 99999,
      })
    }
  }

  useEffect(() => {
    if (open) {
      updatePosition()
      window.addEventListener("scroll", updatePosition, true)
      window.addEventListener("resize", updatePosition)
      return () => {
        window.removeEventListener("scroll", updatePosition, true)
        window.removeEventListener("resize", updatePosition)
      }
    }
  }, [open])

  const selectedLabel = options.find(opt => opt.value === value)?.label || options[0]?.label

  const dropdown =
    open &&
    createPortal(
      <ul ref={dropdownRef} style={dropdownStyle} className="bg-white border border-[var(--border)] rounded-[8px] shadow-lg max-h-[200px] overflow-y-auto">
        {options.map(opt => (
          <li
            key={opt.value}
            onClick={() => {
              onChange(opt.value)
              setOpen(false)
            }}
            className={`px-2 md:px-3 py-2 text-xs md:text-sm cursor-pointer ${opt.value === value ? "bg-[var(--primary)] text-white" : "text-gray-800 hover:bg-gray-100"}`}
          >
            {opt.label}
          </li>
        ))}
      </ul>,
      document.body
    )

  return (
    <div ref={ref} className={`relative ${className}`}>
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setOpen(!open)}
        className={`w-full h-[32px] md:h-[36px] border rounded-[8px] px-2 md:px-3 bg-white text-left text-xs md:text-sm font-normal text-gray-800 flex items-center justify-between gap-1 focus:outline-none transition-colors ${open ? "border-[var(--primary)]" : "border-[var(--border)]"} ${buttonClassName}`}
      >
        <span className="truncate">{selectedLabel}</span>
        <ChevronDown size={16} className={`shrink-0 text-gray-400 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {dropdown}
    </div>
  )
}

export default CustomSelect
