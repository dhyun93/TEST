import { Loader2 } from "lucide-react"

interface SpinnerProps {
  fullscreen?: boolean
  className?: string
  size?: number
}

export default function Spinner({ fullscreen = false, className = "", size = 23 }: SpinnerProps) {
  if (fullscreen) {
    return (
      <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/5 backdrop-blur-[1px]">
        <Loader2 className="animate-spin text-[#869CAE]" size={32} />
      </div>
    )
  }

  return <Loader2 className={`animate-spin text-[#869CAE] ${className}`} size={size} />
}
