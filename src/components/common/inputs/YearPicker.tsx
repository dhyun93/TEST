import React, { useState, useRef, useEffect } from "react"
import { ChevronDown } from "lucide-react"

interface YearPickerProps {
  year: string
  onChange: (year: string) => void
  size?: "default" | "small"
}

const YearPicker: React.FC<YearPickerProps> = ({ year, onChange, size = "default" }) => {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  const currentYear = new Date().getFullYear()
  const years = Array.from({ length: 5 }, (_, i) => (currentYear - i).toString())

  const isSmall = size === "small"

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className={`flex items-center justify-between border rounded-full bg-white text-gray-600 focus:outline-none transition-colors ${open ? "border-[var(--primary)]" : "border-[var(--border)]"} ${
          isSmall ? "h-[28px] md:h-[32px] px-3 md:px-4 w-[80px] md:w-[100px] text-xs md:text-sm" : "h-[32px] md:h-[36px] px-3 md:px-4 w-[90px] md:w-[110px] text-xs md:text-sm"
        }`}
      >
        <span>{year}</span>
        <ChevronDown size={14} className={`shrink-0 text-gray-500 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <ul
          className={`absolute z-50 top-full left-0 mt-1 bg-white border border-[var(--border)] rounded-[8px] shadow-lg overflow-hidden ${isSmall ? "w-[80px] md:w-[100px]" : "w-[90px] md:w-[110px]"}`}
        >
          {years.map(y => (
            <li
              key={y}
              onClick={() => {
                onChange(y)
                setOpen(false)
              }}
              className={`px-3 md:px-4 py-2 text-xs md:text-sm cursor-pointer ${y === year ? "bg-[var(--primary)] text-white" : "text-gray-800 hover:bg-gray-100"}`}
            >
              {y}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export default YearPicker
