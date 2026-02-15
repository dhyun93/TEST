import React, { useState, useEffect } from "react"

export interface EditableTextAreaProps {
  value: string
  onChange: (val: string) => void
  placeholder?: string
  className?: string
  maxLength?: number
  disabled?: boolean
  rows?: number
}

const EditableTextArea: React.FC<EditableTextAreaProps> = ({ value, onChange, placeholder = "", className = "", maxLength = 2000, disabled = false, rows = 3 }) => {
  const [textValue, setTextValue] = useState<string>(value)

  useEffect(() => {
    setTextValue(value)
  }, [value])

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    let val = e.target.value
    if (maxLength && val.length > maxLength) val = val.slice(0, maxLength)
    setTextValue(val)
    onChange(val)
  }

  return (
    <div className="w-full h-full py-1">
      <textarea
        value={textValue}
        onChange={handleChange}
        placeholder={placeholder}
        disabled={disabled}
        rows={rows}
        className={`
          w-full px-2 md:px-3 py-2 md:py-2.5 rounded-[8px] border border-[var(--border)]
          text-xs md:text-sm font-normal text-gray-800 transition-all
          bg-white placeholder:text-xs placeholder:md:text-sm placeholder:text-gray-500
          focus:outline-none focus:border-[var(--primary)]
          resize-none leading-relaxed block
          ${disabled ? "bg-gray-100 cursor-not-allowed text-gray-500" : ""}
          ${className}
        `}
      />
    </div>
  )
}

export default EditableTextArea
