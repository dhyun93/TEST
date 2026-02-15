import React from "react"
import { Wand2 } from "lucide-react"

interface InfoBoxProps {
  message: string
}

const InfoBox: React.FC<InfoBoxProps> = ({ message }) => (
  <div>
    <div className="mb-1 p-2 sm:p-3 bg-blue-50 border border-blue-100 rounded-lg text-[11px] sm:text-xs md:text-sm text-[#031E36] flex items-center gap-1">
      <Wand2 size={14} className="sm:w-4 sm:h-4 text-blue-400 shrink-0" />
      <span>{message}</span>
    </div>
  </div>
)

export default InfoBox
