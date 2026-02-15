import React from "react"

interface DatePickerProps {
  value: string
  onChange: (date: string) => void
  placeholder?: string
  className?: string
}

const DatePicker: React.FC<DatePickerProps> = ({ value, onChange, placeholder = "날짜 선택", className = "" }) => {
  return (
    <input
      type="date"
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      className={`w-full h-[32px] md:h-[36px] border border-[var(--border)] rounded-[8px] px-2 md:px-3 bg-white text-xs md:text-sm font-normal text-gray-800 focus:outline-none focus:border-[var(--primary)] transition-colors cursor-pointer ${className}`}
    />
  )
}

export default DatePicker
