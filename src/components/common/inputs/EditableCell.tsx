import React, { useState, useEffect } from "react"

export interface EditableCellProps {
  value: string
  onChange: (val: string) => void
  placeholder?: string
  className?: string
  maxLength?: number
  formatter?: (value: string) => string
  disabled?: boolean
}

const EditableCell: React.FC<EditableCellProps> = ({ value, onChange, placeholder = "", className = "", maxLength = 30, formatter, disabled = false }) => {
  const [inputValue, setInputValue] = useState<string>(value)

  useEffect(() => {
    setInputValue(value)
  }, [value])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value
    if (formatter) {
      val = formatter(val)
    }
    if (val.length > maxLength) val = val.slice(0, maxLength)
    setInputValue(val)
    onChange(val)
  }

  return (
    <div className="w-full py-1">
      <input
        type="text"
        value={inputValue}
        onChange={handleChange}
        placeholder={placeholder}
        disabled={disabled}
        className={`
          w-full min-w-[60px] md:min-w-[80px] h-[32px] md:h-[36px] px-2 md:px-3 rounded-[8px] border border-[var(--border)]
          text-xs md:text-sm font-normal text-gray-800 text-left outline-none
          placeholder:text-xs placeholder:md:text-sm placeholder:text-gray-500
          whitespace-nowrap overflow-hidden text-ellipsis appearance-none
          focus:border-[var(--primary)]
          ${disabled ? "bg-transparent border-transparent" : "bg-white"}
          cursor-text
          ${className}
        `}
      />
    </div>
  )
}

export default EditableCell
